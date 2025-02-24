document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-card");

    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        if (!regex.test(username)) {
            alert("Invalid username format");
            return false;
        }
        return true;
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const targetUrl = "https://leetcode.com/graphql/";

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
          
            const graphqlQuery = JSON.stringify({
                query: `
                  query userSessionProgress($username: String!) {
                    allQuestionsCount {
                      difficulty
                      count
                    }
                    matchedUser(username: $username) {
                      submitStats {
                        acSubmissionNum {
                          difficulty
                          count
                        }
                        totalSubmissionNum {
                          difficulty
                          count
                          submissions
                        }
                      }
                    }
                  }
                `,
                variables: { username }
            });
            
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphqlQuery, // ✅ Corrected: Now using the right variable name
                redirect: "follow",
            };
            
            const response = await fetch(targetUrl, requestOptions);
            if (!response.ok) throw new Error("Unable to fetch user details");

            const parsedData = await response.json();
            displayUserData(parsedData);
        } catch (error) {
            statsContainer.innerHTML = `<p>${error.message}</p>`;
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parsedData) {
        if (!parsedData.data || !parsedData.data.matchedUser) {
            statsContainer.innerHTML = `<p>User not found or data unavailable</p>`;
            return;
        }

        const totalEasyQues = parsedData.data.allQuestionsCount[1]?.count || 0;
        const totalMediumQues = parsedData.data.allQuestionsCount[2]?.count || 0;
        const totalHardQues = parsedData.data.allQuestionsCount[3]?.count || 0;

        const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1]?.count || 0;
        const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2]?.count || 0;
        const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3]?.count || 0;

        updateProgress(solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

        cardStatsContainer.innerHTML = `
            <div class="card"><h4>Overall Submissions</h4><p>${parsedData.data.matchedUser.submitStats.totalSubmissionNum[0]?.submissions || 0}</p></div>
            <div class="card"><h4>Easy Submissions</h4><p>${parsedData.data.matchedUser.submitStats.totalSubmissionNum[1]?.submissions || 0}</p></div>
            <div class="card"><h4>Medium Submissions</h4><p>${parsedData.data.matchedUser.submitStats.totalSubmissionNum[2]?.submissions || 0}</p></div>
            <div class="card"><h4>Hard Submissions</h4><p>${parsedData.data.matchedUser.submitStats.totalSubmissionNum[3]?.submissions || 0}</p></div>
        `;
    }

    searchButton.addEventListener("click", function () {
        const username = usernameInput.value.trim();
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});

