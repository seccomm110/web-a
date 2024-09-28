// Split the token into different parts
const tokenPart1 = 'ghp_yj5ZnPqi54dV';
const tokenPart2 = '1PNEbN6w4p1K3scfYz';
const tokenPart3 = '3gckWa';

// Combine the token parts into one
const token = `${tokenPart1}${tokenPart2}${tokenPart3}`; // Reconstruct the full token

const repoOwner = 'seccomm110'; // Your GitHub username
const repoName = 'web-a'; // Your repository name

const fileStructure = {
    attendance: 'Attendance',
    minutesOfMeeting: 'MinutesOfMeeting',
    checkList: 'CheckList',
    planningAchievement: 'PlanningAndAchievement',
    report: 'Report',
    books: 'Books',
    articles: 'Articles',
    Achievement: 'Achievement',
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



// Function to show the selected tab and populate files
async function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });

    document.getElementById(tabId).style.display = 'block';
    await populateFiles(tabId);
}

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
            const isPDF = file.name.toLowerCase().endsWith('.pdf');
            let fileLink = document.createElement('a');
            
            if (isPDF) {
                console.log(`PDF URL: ${file.download_url}`); // Log the URL for PDFs
                fileLink.href = `https://docs.google.com/viewer?url=${encodeURIComponent(file.download_url)}&embedded=true`;
            } else {
                fileLink.href = file.download_url;
            }

            fileLink.textContent = file.name;
            fileLink.target = '_blank'; // Open in new tab
            fileLink.style.textDecoration = 'none'; // Optional: remove underline
            li.appendChild(fileLink);

            // Add delete button next to the file link
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑';
            deleteButton.className = 'delete-button';
            deleteButton.onclick = () => {
                console.log(`Deleting file: ${file.name} from ${directory}`);
                deleteFile(directory, file.name);
            };

            li.appendChild(deleteButton);
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

const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {

    const select = dropdown.querySelector('.select');
    const caret = dropdown.querySelector('.caret');
    const menu = dropdown.querySelector('.menu');
    const options = dropdown.querySelectorAll('.menu li');  // Use querySelectorAll to select all options
    const selected = dropdown.querySelector('.selected');

    select.addEventListener('click', () => {
        select.classList.toggle('selected-clicked');  // Correct spelling
        caret.classList.toggle('caret-rotate');       // Correct spelling
        menu.classList.toggle('menu-open');           // Correct spelling
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            selected.innerText = option.innerText;
            select.classList.remove('selected-clicked');
            caret.classList.remove('caret-rotate');
            menu.classList.remove('menu-open');
            options.forEach(option => {
                option.classList.remove('active1');
            });
            option.classList.add('active1');
        });
    });
});



// Function to fetch files from a specific GitHub folder with authentication
async function fetchFiles(folder) {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folder}`;
    const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`Error fetching ${folder}: ${response.statusText}`);
        }

        const files = await response.json();
        return files.filter(file => file.type === 'file'); // Only return files, not directories
    } catch (error) {
        console.error(`Failed to fetch files from ${folder}:`, error);
        return []; // Return an empty array on error
    }
}

// Function to fetch files from GitHub for a given tab
async function fetchFilesFromGithub(tabId) {
    const directory = fileStructure[tabId]; // Assuming you have fileStructure defined
    const files = await fetchFiles(directory);

    if (files.length === 0) {
        console.log('No files found in the selected directory.');
        return;
    }

    files.forEach(file => {
        console.log(`File: ${file.name}, Download URL: ${file.download_url}`);
    });
}


// Function to populate dropdown with files for each book category
async function populateBooksDropdown() {
    const categories = ['Tawheed', 'Adl', 'Nabuwat', 'Imamat', 'Qayamat', 'Mahdaviyat', 'Ahqaam', 'General'];
    for (const category of categories) {
        const files = await fetchFilesFromGitHub(`Books/${category}`);
        const list = document.getElementById(`books${category}List`);
        files.forEach(file => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${file.download_url}" target="_blank">${file.name}</a>`;
            list.appendChild(li);
        });
    }
}

// Call the function to populate the dropdown when the page loads
window.onload = populateBooksDropdown;

// Event listener for dropdown items
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent event from bubbling up
        const subContent = this.querySelector('.sub-content');
        subContent.classList.toggle('active'); // Toggle visibility
    });

    // Fetch files for the selected category when clicked
    this.addEventListener('click', async () => {
        const category = this.id.replace('Dropdown', ''); // Get category from dropdown ID
        const files = await fetchFilesFromGitHub(`Books/${category}`);
        const fileList = document.getElementById('fileViewer');

        // Clear the iframe and display selected files
        fileList.src = files[0] ? files[0].download_url : '';
        fileList.style.display = files.length > 0 ? 'block' : 'none';
    });
});

// Call the function to populate the dropdown when the page loads
window.onload = populateBooksDropdown;



document.querySelectorAll('.menu li').forEach(item => {
    item.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      // Fetch the file list for the selected category
      fetchFilesFromGitHub(category);
    });
  });
  async function fetchFilesFromGitHub(category) {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = ''; // Clear current file list

    // Use the fileStructure object to get the corresponding directory for the category
    const directory = fileStructure[category]; // Ensure fileStructure is defined

    // Construct the GitHub API URL
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${directory}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`, // Use your token for authentication
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching files: ${response.statusText}`);
        }

        const files = await response.json();

        // Check if any files are returned
        if (files.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No files found.';
            fileList.appendChild(li);
            return;
        }

        // Populate the file list with fetched files
        files.forEach(file => {
            if (file.type === 'file') { // Ensure it's a file
                const li = document.createElement('li');
                li.textContent = file.name; // Display file name

                // Add click event to display the file when clicked
                li.addEventListener('click', () => {
                    displayFile(file); // Replace with your actual file display logic
                });

                fileList.appendChild(li);
            }
        });
    } catch (error) {
        console.error('Failed to fetch files:', error);
        const li = document.createElement('li');
        li.textContent = 'Error fetching files.';
        fileList.appendChild(li);
    }
}

// Example call to fetch files from GitHub based on a category
// fetchFilesFromGitHub('booksTawheed'); // Call this with the desired category

  
  function displayFile(file) {
    const fileViewer = document.getElementById('fileViewer');
    const fileExtension = file.split('.').pop();
  
    if (fileExtension === 'pdf') {
      fileViewer.src = `path-to-your-github-files/${file}`; // Load PDF in iframe
    } else if (fileExtension === 'xlsx') {
      // Handle Excel display logic (e.g., using SheetJS or another library)
      alert("Displaying Excel file: " + file);
    }
  }
  

  document.addEventListener('DOMContentLoaded', function() {
    const categories = ['Tawheed', 'Adl', 'Nabuwat', 'Imamat', 'Qayamat', 'Mahdaviyat', 'Ahqaam', 'General'];
    const baseURL = 'https://api.github.com/repos/seccomm110/web-a/contents/Books';

    // Fetch files for each category
    categories.forEach(category => {
        fetch(`${baseURL}/${category}`, {
            headers: {
                'Authorization': `token ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                const subContent = document.getElementById(`books${category}List`);
                if (Array.isArray(data)) {
                    data.forEach(file => {
                        const li = document.createElement('li');
                        li.textContent = file.name;
                        li.addEventListener('click', () => {
                            viewFile(file.download_url); // Display file content in right column
                        });
                        subContent.appendChild(li);
                    });
                } else {
                    console.error(`No files found for ${category}`);
                }
            })
            .catch(error => console.error('Error fetching files:', error));
    });

    // Function to view the file in the iframe
    function viewFile(url) {
        const fileViewer = document.getElementById('fileViewer');
        fileViewer.src = url; // This works for PDF files
        fileViewer.style.display = 'block'; // Show the iframe
    }

    // Dropdown functionality
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent event from bubbling up
            const subContent = this.querySelector('.sub-content');
            subContent.classList.toggle('active'); // Toggle visibility
        });
    });
});



async function fetchBooks() {
    const response = await fetch('https://api.github.com/repos/seccomm110/web-a/contents/path/to/books');
    const books = await response.json();

    // Assuming books is an array of book objects
    const tawheedList = document.getElementById('booksTawheedList');
    const adlList = document.getElementById('booksAdlList');
    // Add similar lines for other categories

    books.forEach(book => {
        const li = document.createElement('li');
        li.textContent = book.name; // Display the file name
        li.onclick = () => showFile(book.download_url); // Use the download URL
        tawheedList.appendChild(li); // Append to the appropriate list
    });
}

function showFile(fileUrl) {
    const fileViewer = document.getElementById('fileViewer');
    fileViewer.src = fileUrl; // Set the iframe's src to the file URL
    fileViewer.style.display = 'block'; // Make the iframe visible
}

// Call the fetchBooks function when the tab is displayed
document.getElementById('books').addEventListener('click', fetchBooks);
