$(document).ready(function() {
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
        window.location.href = 'category.html';
    });

    $('#price-range').on('input', function() {
        const value = $(this).val();
        console.log('Price range: $' + value);
    });

    $('.filter-btn').on('click', function() {
        $(this).toggleClass('active');
        alert('Filter functionality would be implemented here');
    });

    $('.clear-filters').on('click', function() {
        $('.filter-btn').removeClass('active');
        alert('Filters cleared');
    });

    $('.apply-filters-btn').on('click', function() {
        alert('Filters applied');
    });

    $('.reset-btn').on('click', function() {
        $('.filter-select').prop('selectedIndex', 0);
        $('#price-range').val(50);
        alert('Filters reset');
    });
});
