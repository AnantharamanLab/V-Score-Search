document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    const pagination = document.getElementById('pagination');
    let tableData = [];
    let sortOrder = {}; // To keep track of sort order for each column
    let currentPage = 1;
    const rowsPerPage = 500;

    // Function to load CSV data
    function loadCSV() {
        Papa.parse('VScoreDataNormalized.csv', {
            download: true,
            header: true,
            complete: function(results) {
                console.log('Parsed CSV data:', results.data); // Log parsed data
                tableData = results.data;
                displayData(tableData);
                renderPagination();
            },
            error: function(error) {
                console.error('Error parsing CSV:', error); // Log errors
            }
        });
    }

    // Function to display data in the table
    function displayData(data) {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = data.slice(start, end);
        dataTable.innerHTML = ''; // Clear existing data
        paginatedData.forEach(row => {
            const tr = document.createElement('tr');
            for (const key in row) {
                const td = document.createElement('td');
                td.textContent = row[key];
                tr.appendChild(td);
            }
            dataTable.appendChild(tr);
        });
    }

// Function to filter data based on search input
function filterData() {
    const filters = searchInput.value.toLowerCase().split(',').map(filter => filter.trim()); // Split search input by comma and trim whitespace
    const filteredData = tableData.filter(row => {
        return filters.every(filter => {
            return Object.values(row).some(value => value.toString().toLowerCase().includes(filter));
        });
    });
    displayData(filteredData);
    renderPagination();
}

 // Function to sort data based on column
function sortData(column) {
    const isAscending = sortOrder[column] !== 'asc';
    sortOrder[column] = isAscending ? 'asc' : 'desc';

    const searchValue = searchInput.value.toLowerCase();
    const filters = searchValue.split(',').map(filter => filter.trim()); // Split search input by comma and trim whitespace
    const filteredData = tableData.filter(row => {
        return filters.every(filter => {
            return Object.values(row).some(value => value.toString().toLowerCase().includes(filter));
        });
    });

    const sortedData = [...filteredData].sort((a, b) => {
        // Convert values to numbers if they are numeric
        const valueA = isNaN(parseFloat(a[column])) ? a[column] : parseFloat(a[column]);
        const valueB = isNaN(parseFloat(b[column])) ? b[column] : parseFloat(b[column]);

        if (valueA < valueB) return isAscending ? -1 : 1;
        if (valueA > valueB) return isAscending ? 1 : -1;
        return 0;
    });

    displayData(sortedData);
    renderPagination();
}



    // Function to render pagination with limited number of buttons
    function renderPagination() {
        const filteredData = tableData.filter(row => {
            return Object.values(row).some(value => value.toString().toLowerCase().includes(searchInput.value.toLowerCase()));
        });
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        pagination.innerHTML = '';
        const maxButtons = 5; // Maximum number of pagination buttons to display

        // Previous page button
        const prevButton = document.createElement('button');
        prevButton.textContent = '«';
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayData(filteredData);
                renderPagination(); // Re-render pagination after changing currentPage
            }
        });
        pagination.appendChild(prevButton);

        // First few pages
        for (let i = Math.max(1, currentPage - Math.floor(maxButtons / 2)); i <= Math.min(currentPage + Math.floor(maxButtons / 2), totalPages); i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.addEventListener('click', ((page) => {
                return () => {
                    currentPage = page;
                    displayData(filteredData);
                    renderPagination(); // Re-render pagination after changing currentPage
                };
            })(i));
            pagination.appendChild(pageButton);
        }

        // Next page button
        const nextButton = document.createElement('button');
        nextButton.textContent = '»';
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayData(filteredData);
                renderPagination(); // Re-render pagination after changing currentPage
            }
        });
        pagination.appendChild(nextButton);

        // Page number search input
        const pageInput = document.createElement('input');
        pageInput.type = 'number';
        pageInput.min = 1;
        pageInput.max = totalPages;
        pageInput.value = currentPage;
        pageInput.addEventListener('change', () => {
            let pageNum = parseInt(pageInput.value);
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                currentPage = pageNum;
                displayData(filteredData);
                renderPagination(); // Re-render pagination after changing currentPage
            } else {
                pageInput.value = currentPage;
            }
        });
        pagination.appendChild(pageInput);

        // Current page display
        const currentPageDisplay = document.createElement('span');
        currentPageDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
        pagination.appendChild(currentPageDisplay);
    }

    // Event listener for search input
    searchInput.addEventListener('keyup', filterData);

    // Event listeners for table headers (sorting)
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-column');
            sortData(column);
        });
    });

    // Load CSV data on page load
    loadCSV();
});
