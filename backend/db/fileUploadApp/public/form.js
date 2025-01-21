const dropBox = document.querySelector(".drop_box");
const chooseFileBtn = document.getElementById("chooseFileBtn");
const input = document.getElementById("fileID");

// hidden file input when the button is clicked
chooseFileBtn.onclick = () => {
    input.click();
};

// Update the UI when a file is selected
input.addEventListener("change", function (e) {
    const fileName = e.target.files[0].name;
    dropBox.innerHTML = `
        <header>
            <h4>File Selected: ${fileName}</h4>
        </header>
        <p>Files Supported: CSV</p>
        <button type="submit" class="btn">Upload</button>
    `;
});


