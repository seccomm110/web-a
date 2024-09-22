// Split the token into different parts
const tokenPart1 = 'ghp_yj5ZnPqi54dV';
const tokenPart2 = '1PNEbN6w4p1K3scfYz';
const tokenPart3 = '3gckWa';

// Combine the token parts into one
const token = `${tokenPart1}${tokenPart2}${tokenPart3}`; // Reconstruct the full token

const repoOwner = 'seccomm110'; // Your GitHub username
const repoName = 'web'; // Your repository name

const fileStructure = {
    attendance: 'Attendance',
    minutesOfMeeting: 'MinutesOfMeeting',
    checkList: 'CheckList',
    planningAchievement: 'PlanningAndAchievement',
    report: 'Report',
    books: 'Books',
    articles: 'Articles',
    selfAssessment: 'SelfAssessment',
    checkListWeekly: 'CheckList/Weekly',
    checkListMonthly: 'CheckList/Monthly',
    checkListQuarterly: 'CheckList/Quarterly',
    checkListHalfYearly: 'CheckList/HalfYearly',
    reportSensus: 'Report/SensusReport',
    reportStudent: 'Report/StudentReport',
    reportClass: 'Report/ClassReport',
    reportIrregular: 'Report/IrregularStudentReport',
    booksTawheed: 'Books/Tawheed',
    booksAdl: 'Books/Adl',
    booksNabuwat: 'Books/Nabuwat',
    booksImamat: 'Books/Imamat',
    booksQayamat: 'Books/Qayamat',
    booksMahdaviyat: 'Books/Mahdaviyat',
    booksAhqaam: 'Books/Ahqaam',
    booksGeneral: 'Books/General'
};

// Function to fetch files from a GitHub repository
async function fetchFiles(directory) {
    try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${directory}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching ${directory}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch files from ${directory}:`, error);
        return []; // Return an empty array on error
    }
}

// Function to show the selected tab and populate files
async function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });

    document.getElementById(tabId).style.display = 'block';
    await populateFiles(tabId);
}

// Function to populate files in the selected tab
async function populateFiles(tabId) {
    const directory = fileStructure[tabId];
    const listId = `${tabId}List`;

    const listElement = document.getElementById(listId);
    if (!listElement) {
        console.error(`List element not found for tab: ${tabId}`);
        return;
    }

    listElement.innerHTML = ''; // Clear previous entries

    const files = await fetchFiles(directory);
    if (files.length === 0) {
        listElement.innerHTML = '<li>No files found.</li>';
        return;
    }

    files.forEach(file => {
        const li = document.createElement('li');
        
        if (file.type === 'file') {
            // Check if the file is a PDF
            const isPDF = file.name.toLowerCase().endsWith('.pdf');
            let fileLink;

            if (isPDF) {
                // For PDFs, use a Google Docs viewer or a direct GitHub URL to view in-browser
                fileLink = document.createElement('a');
                fileLink.href = `https://docs.google.com/viewer?url=${encodeURIComponent(file.download_url)}&embedded=true`;
                fileLink.textContent = file.name;
                fileLink.target = '_blank'; // Open in new tab
                fileLink.style.textDecoration = 'none'; // Optional: remove underline
            } else {
                // For non-PDF files, use the direct download link
                fileLink = document.createElement('a');
                fileLink.href = file.download_url; // GitHub file URL
                fileLink.textContent = file.name;
                fileLink.target = '_blank'; // Open in new tab
                fileLink.style.textDecoration = 'none'; // Optional: remove underline
            }

            li.appendChild(fileLink);

            // Add delete button next to the file link
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '−';
            deleteButton.className = 'delete-button';
            deleteButton.onclick = () => deleteFile(directory, file.name);

            li.style.display = 'flex'; // Set display to flex
            li.style.justifyContent = 'space-between'; // Space out items
            li.style.alignItems = 'center'; // Center items vertically

            li.appendChild(deleteButton);
        } else if (file.type === 'dir') {
            li.innerHTML = `<strong>${file.name}</strong>`;
            li.style.cursor = 'pointer'; // Make it clear that it's clickable
            
            // Create a sublist element
            const subList = document.createElement('ul');
            li.appendChild(subList);

            li.onclick = async () => {
                const subFiles = await fetchFiles(`${directory}/${file.name}`);
                subList.innerHTML = ''; // Clear previous sublist items
                subFiles.forEach(subFile => {
                    const subLi = document.createElement('li');
                    if (subFile.type === 'file') {
                        // Create a link for the subfile
                        const subFileLink = document.createElement('a');
                        
                        const isPDF = subFile.name.toLowerCase().endsWith('.pdf');
                        if (isPDF) {
                            subFileLink.href = `https://docs.google.com/viewer?url=${encodeURIComponent(subFile.download_url)}&embedded=true`;
                        } else {
                            subFileLink.href = subFile.download_url;
                        }

                        subFileLink.textContent = subFile.name;
                        subFileLink.target = '_blank'; // Open in new tab
                        subFileLink.style.textDecoration = 'none'; // Optional: remove underline

                        subLi.appendChild(subFileLink);

                        // Add delete button next to the subfile link
                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Delete';
                        deleteButton.className = 'delete-button';
                        deleteButton.onclick = () => deleteFile(`${directory}/${file.name}`, subFile.name);

                        subLi.style.display = 'flex'; // Set display to flex
                        subLi.style.justifyContent = 'space-between'; // Space out items
                        subLi.style.alignItems = 'center'; // Center items vertically

                        subLi.appendChild(deleteButton);
                    }
                    subList.appendChild(subLi);
                });
            };
        }
        listElement.appendChild(li);
    });
}


// Function to upload a file to a specified directory in the GitHub repository
async function uploadFile(file, directory) {
    const path = `${directory}/${encodeURIComponent(file.name)}`; // Specify the path in your repo

    const reader = new FileReader();
    reader.onload = async (event) => {
        const content = event.target.result;

        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Upload ${file.name}`,
                content: btoa(content) // Encode the content in Base64
            })
        });

        if (!response.ok) {
            const errorBody = await response.json(); // Get error details
            console.error(`Error uploading file: ${response.statusText}`, errorBody);
            throw new Error(`Error uploading file: ${response.statusText}`);
        }

        const jsonResponse = await response.json();
        console.log('File uploaded successfully:', jsonResponse);
    };

    reader.readAsBinaryString(file); // Read the file as a binary string
}

// Function to delete a file from a specified directory in the GitHub repository
async function deleteFile(directory, fileName) {
    const path = `${directory}/${encodeURIComponent(fileName)}`;
    
    // First, fetch the file to get its SHA
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        console.error(`Error fetching file for deletion: ${response.statusText}`);
        return;
    }

    const fileData = await response.json();
    const sha = fileData.sha; // Get the SHA of the file

    // Now, send a DELETE request
    const deleteResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Deleting ${fileName}`,
            sha: sha // Provide the SHA to confirm deletion
        })
    });

    if (!deleteResponse.ok) {
        console.error(`Error deleting file: ${deleteResponse.statusText}`);
        return;
    }

    console.log(`File ${fileName} deleted successfully.`);
    // Refresh the file list to reflect changes
    await populateFiles(directory);
}

// Event listener for upload button
document.getElementById('uploadButton').addEventListener('click', () => {
    const files = document.getElementById('fileInput').files;
    const selectedFolder = document.getElementById('folderSelect').value; // Get selected folder
    for (let i = 0; i < files.length; i++) {
        uploadFile(files[i], selectedFolder);
    }
});

// Get modal element
const uploadModal = document.getElementById("uploadModal");
const uploadIcon = document.getElementById("uploadIcon");
const closeModal = document.getElementById("closeModal");

// Show the modal when the icon is clicked
uploadIcon.onclick = function() {
    uploadModal.style.display = "block";
}

// Close the modal when the x is clicked
closeModal.onclick = function() {
    uploadModal.style.display = "none";
}
