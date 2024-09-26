document.addEventListener("DOMContentLoaded", function() {
    // Show the Dashboard by default on page load
    showContent("dashboard");

    // Add event listeners to navbar items
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", function() {
            const target = this.getAttribute("data-target");
            showContent(target);
        });
    });

    fetchClassData(); // Fetch class data after DOM content is loaded
});

function showContent(contentType) {
    // Hide all sections
    document.querySelectorAll(".tab-content").forEach(section => {
        section.style.display = "none"; // Hide all sections
    });

    // Show the selected section
    const contentSection = document.getElementById(contentType);
    if (contentSection) {
        contentSection.style.display = "block"; // Show the selected section
    }

    // Clear Dashboard content if navigating away
    if (contentType !== "dashboard") {
        const dashboardContent = document.getElementById("dashboardContent");
        dashboardContent.innerHTML = ""; // Clear previous content
    }
}

    // Fetch and display class data when the Dashboard is shown
    function fetchClassData() {
        // Define your class names and corresponding file paths
        const classes = {
            AUH1: "Dashboard/AUD1- Class Detail.xlsx",
            DS3: "Dashboard/DS3 - Class Detail.xlsx",
            DS5: "Dashboard/DS5 - Class Detail.xlsx",
            event: "Dashboard/Event 2024.xlsx" // Added Event 2024.xlsx
        };

        // Iterate over class names and set up click events
        for (const className in classes) {
            const classCard = document.getElementById(`class-${className}`);
            if (classCard) {
                classCard.style.cursor = "pointer"; // Change cursor to pointer to indicate clickability
                classCard.addEventListener("click", function() {
                    // Fetch the file when the class card is clicked
                    const filePath = classes[className];
                    fetchExcelContent(filePath); // Function to fetch and display content
                });
            }
        }
    }

    function fetchExcelContent(filePath) {
        const dashboardContent = document.getElementById("dashboardContent");
        dashboardContent.innerHTML = "Loading..."; // Show loading message

        // Fetch the Excel file
        fetch(filePath)
            .then(response => response.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0]; // Get the first sheet
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert to JSON

                displayExcelContent(jsonData); // Function to render data on the page
            })
            .catch(error => {
                console.error("Error fetching or parsing Excel file:", error);
                dashboardContent.innerHTML = "Error loading file.";
            });
    }

    function displayExcelContent(data) {
        const dashboardContent = document.getElementById("dashboardContent");
        dashboardContent.innerHTML = ""; // Clear previous content

        const table = document.createElement("table");
        table.classList.add("excel-table");

        // Populate table with Excel data
        data.forEach((row, rowIndex) => {
            const tr = document.createElement("tr");
            row.forEach(cell => {
                const td = document.createElement(rowIndex === 0 ? "th" : "td"); // Use <th> for header row
                td.textContent = cell || ""; // Handle empty cells
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });

        dashboardContent.appendChild(table); // Display the table
    }

    // Check if the user is authenticated
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html'; // Redirect to login page
    }
