// 插件
// 监听全局键盘事件
document.addEventListener('keydown', async(event) => {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveCurrentFile();
    }
    if (event.ctrlKey && event.key === 'w') {
        event.preventDefault();
        closeCurrentFile();
    }
    if (event.key === 'F11') {
        event.preventDefault();
        const isFullscreen = await appWindow.isFullscreen();
        appWindow.setFullscreen(!isFullscreen);
    }
});

// 保存当前活动的文件
function saveCurrentFile() {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        const filename = activeTab.dataset.filename;
        save(filename);
    }
}

// 保存当前活动的文件
function closeCurrentFile() {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        const filename = activeTab.dataset.filename;
        checkForUnsavedChanges(filename);
    }
}



// 40 ---- 135
// 拆分active.tab的上一个文件夹
document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('search-filename');
    const searchResults = document.getElementById('search-results');
    const searchBox = document.getElementById('searchBox');
    const searchContainer = document.getElementById('searchContainer');
    const searchResultsContainer = document.getElementById('searchResults');


    let Files = [];

    function getPath(path) {
        return path.split('/').slice(0, -1).join('/');
    }

    function get_activefile() {
        const activeTab = document.querySelector('.tab.active');
        return activeTab ? getPath(activeTab.dataset.fullPath) : currentPath;
    }

    async function get_all_file(originPath) {
        try {
            Files = await invoke('get_all_file', { originPath });
            console.log('Files:', Files);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function filterFiles(pattern) {
        try {
            return await invoke('find_file', { pattern, file: Files });
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    async function searchFilesWithPattern(originPath, pattern) {
        try {
            return await invoke('get_files_with_pattern', { originPath, pattern });
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    async function updateActivePath() {
        await get_all_file(get_activefile());
    }

    searchInput.addEventListener('input', async () => {
        const pattern = searchInput.value;
        const filteredFiles = await filterFiles(pattern);
        showResults(filteredFiles);
    });

    searchBox.addEventListener('input', async () => {
        const pattern = searchBox.value;
        if (pattern) {
            const activePath = get_activefile();
            const filteredResults = await searchFilesWithPattern(activePath, pattern);
            displayPatternResults(filteredResults);
        } else {
            searchResultsContainer.innerHTML = '';
            searchContainer.style.display = 'none';
        }
    });

    function showResults(results) {
        searchResults.innerHTML = '';
        if (results.length > 0) {
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('search-result-item');
                resultItem.textContent = result;
                searchResults.appendChild(resultItem);
            });
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
        }
    }

    function displayPatternResults(results) {
        searchResultsContainer.innerHTML = '';
        if (results.length > 0) {
            results.forEach(file => {
                for (const [fileName, lines] of Object.entries(file)) {
                    const fileItem = document.createElement('div');
                    fileItem.classList.add('search-result-item-box');
                    fileItem.textContent = `File: ${fileName}`;
                    fileItem.style.backgroundColor = '#61dafb';
                    searchResultsContainer.appendChild(fileItem);

                    lines.forEach(line => {
                        const lineItem = document.createElement('div');
                        lineItem.classList.add('search-result-item-box');
                        lineItem.textContent = line;
                        lineItem.style.paddingLeft = '20px';
                        searchResultsContainer.appendChild(lineItem);
                    });
                }
            });
            searchContainer.style.display = 'block';
        }
    }

    document.addEventListener('click', (event) => {
        if (!searchResults.contains(event.target) && !searchInput.contains(event.target)) {
            searchResults.style.display = 'none';
        }
    });

    const observer = new MutationObserver(() => updateActivePath());

    observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class']
    });



    await updateActivePath();
});