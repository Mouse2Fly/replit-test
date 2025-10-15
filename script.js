let allBooks = [];
let filteredBooks = [];

$(document).ready(function() {
    loadBooks();
    
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'book-detail.html') {
        loadBookDetail();
    }
    
    $('.section-header').on('click', function() {
        const target = $(this).data('toggle');
        const content = $('#' + target);
        
        $(this).toggleClass('active');
        content.toggleClass('active');
    });

    $('.cta-btn').on('click', function() {
        window.location.href = 'category.html';
    });

    $('.category-card').on('click', function() {
        const category = $(this).find('h3').text();
        window.location.href = 'category.html?category=' + encodeURIComponent(category);
    });

    $('.search-btn').on('click', function() {
        performSearch();
    });

    $('.search-bar input').on('keypress', function(e) {
        if (e.which === 13) {
            performSearch();
        }
    });

    $('#price-range').on('input', function() {
        const value = $(this).val();
        updatePriceDisplay(value);
    });

    $('.apply-filters-btn').on('click', function() {
        applyFilters();
    });

    $('.reset-btn').on('click', function() {
        resetFilters();
    });

    $('.clear-filters').on('click', function() {
        resetCategoryFilters();
    });

    $('.sort-select').on('change', function() {
        const sortBy = $(this).val();
        sortBooks(sortBy);
    });
});

function loadBooks() {
    $.getJSON('books.json', function(data) {
        allBooks = data;
        filteredBooks = data;
        
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'search-results.html') {
            displaySearchResults();
        } else if (currentPage === 'category.html') {
            displayCategoryBooks();
        }
    }).fail(function() {
        console.error('Failed to load books data');
    });
}

function performSearch() {
    const searchTerm = $('.search-bar input').val().trim();
    
    if (searchTerm) {
        window.location.href = 'search-results.html?q=' + encodeURIComponent(searchTerm);
    }
}

function displaySearchResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('q') || '';
    
    $('.search-bar input').val(searchTerm);
    
    if (searchTerm) {
        filteredBooks = allBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } else {
        filteredBooks = allBooks;
    }
    
    $('.results-subtitle').text(`for "${searchTerm}" - ${filteredBooks.length} Books Found`);
    updateResultsDisplay();
}

function displayCategoryBooks() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'Fiction';
    
    filteredBooks = allBooks.filter(book => book.category === category);
    
    $('.category-header h1').text(category);
    $('.loading-placeholder').remove();
    
    const booksGrid = $('<div class="books-grid"></div>');
    $('.category-page .container').append(booksGrid);
    
    displayBooksGrid(filteredBooks, '.books-grid');
}

function updateResultsDisplay() {
    $('.results-count').text(`Showing 1-${filteredBooks.length} of ${filteredBooks.length} results`);
    displayBooksGrid(filteredBooks, '.results-grid');
}

function displayBooksGrid(books, containerSelector) {
    const container = $(containerSelector);
    container.empty();
    
    if (books.length === 0) {
        container.html('<div class="no-results">No books found matching your criteria.</div>');
        return;
    }
    
    books.forEach(book => {
        const bookCard = createBookCard(book);
        container.append(bookCard);
    });
}

function createBookCard(book) {
    const stars = generateStars(book.rating);
    const stockBadge = book.stock 
        ? '<span class="stock-badge in-stock">In Stock</span>' 
        : '<span class="stock-badge out-stock">Out of Stock</span>';
    
    return `
        <div class="book-card" data-book-id="${book.id}">
            <div class="book-card-image">
                <div class="book-cover-small">Book Cover</div>
                ${stockBadge}
            </div>
            <div class="book-card-content">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-count">${book.rating} (${book.reviews})</span>
                </div>
                <div class="book-category">${book.category}</div>
                <div class="book-footer">
                    <span class="book-price">$${book.price.toFixed(2)}</span>
                    <button class="quick-view-btn" onclick="viewBook(${book.id})">View Details</button>
                </div>
            </div>
        </div>
    `;
}

function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function viewBook(bookId) {
    window.location.href = 'book-detail.html?id=' + bookId;
}

function applyFilters() {
    const genre = $('.filter-select').eq(0).val();
    const priceMax = parseInt($('#price-range').val());
    const author = $('.filter-select').eq(1).val();
    const rating = $('.filter-select').eq(2).val();
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('q') || '';
    
    let filtered = allBooks;
    
    if (searchTerm) {
        filtered = filtered.filter(book => 
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (genre !== 'All Genres') {
        filtered = filtered.filter(book => book.category === genre);
    }
    
    filtered = filtered.filter(book => book.price <= priceMax);
    
    if (author !== 'All Authors') {
        filtered = filtered.filter(book => book.author === author);
    }
    
    if (rating === '4+ Stars') {
        filtered = filtered.filter(book => book.rating >= 4);
    } else if (rating === '3+ Stars') {
        filtered = filtered.filter(book => book.rating >= 3);
    }
    
    filteredBooks = filtered;
    updateResultsDisplay();
}

function resetFilters() {
    $('.filter-select').prop('selectedIndex', 0);
    $('#price-range').val(100);
    updatePriceDisplay(100);
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('q') || '';
    
    if (searchTerm) {
        filteredBooks = allBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } else {
        filteredBooks = allBooks;
    }
    
    updateResultsDisplay();
}

function resetCategoryFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'Fiction';
    
    filteredBooks = allBooks.filter(book => book.category === category);
    displayBooksGrid(filteredBooks, '.books-grid');
}

function updatePriceDisplay(value) {
    console.log('Price range: $' + value);
}

function sortBooks(sortBy) {
    let sorted = [...filteredBooks];
    
    switch(sortBy) {
        case 'Price: Low to High':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'Price: High to Low':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'Rating':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        default:
            sorted = filteredBooks;
    }
    
    filteredBooks = sorted;
    displayBooksGrid(filteredBooks, '.results-grid');
}

function loadBookDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = parseInt(urlParams.get('id')) || 5;
    
    $.getJSON('books.json', function(data) {
        const book = data.find(b => b.id === bookId);
        
        if (book) {
            document.title = book.title + ' - BookWise';
            $('#book-title').text(book.title);
            $('#book-author').text('by ' + book.author);
            $('#book-stars').html(generateStars(book.rating));
            $('#book-rating-text').text(book.rating + ' (' + book.reviews.toLocaleString() + ' reviews)');
            $('#book-price').text('$' + book.price.toFixed(2));
            $('#book-description').text(book.description);
            $('#breadcrumb-title').text(book.title);
            $('#breadcrumb-category').text(book.category).attr('href', 'category.html?category=' + encodeURIComponent(book.category));
            
            const stockHtml = book.stock 
                ? '<i class="fas fa-check-circle"></i><span>In Stock & Ready to Ship</span>'
                : '<i class="fas fa-times-circle"></i><span>Out of Stock</span>';
            $('#book-stock').html(stockHtml);
            
            if (!book.stock) {
                $('#book-stock').css('color', '#e53e3e');
            }
        } else {
            $('#book-title').text('Book Not Found');
            $('#book-description').text('The requested book could not be found.');
        }
    });
}
