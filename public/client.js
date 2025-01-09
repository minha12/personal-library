$(document).ready(function() {
    let items = [];
    let itemsRaw = [];
    
    function loadBooks() {
        $.getJSON('/api/books', function(data) {
            itemsRaw = data;
            items = [];
            data.forEach((val, i) => {
                items.push(`
                    <button class="list-group-item list-group-item-action bookItem d-flex justify-content-between align-items-center" id="${i}">
                        ${val.title}
                        <span class="badge bg-primary rounded-pill">${val.commentcount}</span>
                    </button>
                `);
            });
            
            $('#display').html(items.join(''));
        });
    }

    loadBooks();

    // Book detail click handler
    $('#display').on('click', '.bookItem', function() {
        $('.bookItem').removeClass('active');
        $(this).addClass('active');
        
        const book = itemsRaw[this.id];
        $("#detailTitle").html(`
            <div class="d-flex justify-content-between align-items-center">
                <h4>${book.title}</h4>
                <small class="text-muted">ID: ${book._id}</small>
            </div>
        `);

        $.getJSON('/api/books/' + book._id, function(data) {
            const comments = data.comments.map(comment => 
                `<div class="comment-item">${comment}</div>`
            ).join('');

            $('#detailComments').html(`
                <div class="comments-section mb-3">
                    <h5>Comments (${data.comments.length})</h5>
                    ${comments}
                </div>
                <form id="newCommentForm" class="mb-3">
                    <div class="input-group">
                        <input type="text" class="form-control" id="commentToAdd" name="comment" placeholder="Add a comment">
                        <button class="btn btn-primary addComment" type="button" id="${data._id}">
                            <i class="bi bi-plus"></i> Add
                        </button>
                    </div>
                </form>
                <button class="btn btn-outline-danger deleteBook" id="${data._id}">
                    <i class="bi bi-trash"></i> Delete Book
                </button>
            `);
        });
    });

    // Delete book handler
    $('#bookDetail').on('click', '.deleteBook', function() {
        if (confirm('Are you sure you want to delete this book?')) {
            $.ajax({
                url: '/api/books/' + this.id,
                type: 'delete',
                success: function(data) {
                    $('#detailComments').html(`
                        <div class="alert alert-success">
                            ${data}
                        </div>
                    `);
                    loadBooks();
                }
            });
        }
    });

    // Add comment handler
    $('#bookDetail').on('click', '.addComment', function() {
        const newComment = $('#commentToAdd').val();
        const bookId = $(this).attr('id');
        
        if (!newComment) return;

        $.ajax({
            url: '/api/books/' + bookId,
            type: 'post',
            dataType: 'json',
            data: $('#newCommentForm').serialize(),
            success: function(data) {
                // Refresh the book details to show new comment
                $.getJSON('/api/books/' + bookId, function(bookData) {
                    const comments = bookData.comments.map(comment => 
                        `<div class="comment-item">${comment}</div>`
                    ).join('');

                    $('#detailComments').html(`
                        <div class="comments-section mb-3">
                            <h5>Comments (${bookData.comments.length})</h5>
                            ${comments}
                        </div>
                        <form id="newCommentForm" class="mb-3">
                            <div class="input-group">
                                <input type="text" class="form-control" id="commentToAdd" name="comment" placeholder="Add a comment">
                                <button class="btn btn-primary addComment" type="button" id="${bookData._id}">
                                    <i class="bi bi-plus"></i> Add
                                </button>
                            </div>
                        </form>
                        <button class="btn btn-outline-danger deleteBook" id="${bookData._id}">
                            <i class="bi bi-trash"></i> Delete Book
                        </button>
                    `);
                });
                
                // Clear the comment input
                $('#commentToAdd').val('');
            },
            error: function(xhr, status, error) {
                alert('Error adding comment: ' + error);
            }
        });
    });

    // New book handler
    $('#newBookForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            url: '/api/books',
            type: 'post',
            dataType: 'json',
            data: $(this).serialize(),
            success: function(data) {
                loadBooks();
                $('#bookTitleToAdd').val('');
            }
        });
    });

    // Delete all books handler
    $('#deleteAllBooks').click(function() {
        if (confirm('Are you sure you want to delete ALL books? This cannot be undone!')) {
            $.ajax({
                url: '/api/books',
                type: 'delete',
                success: function(data) {
                    loadBooks();
                    $('#detailComments').html(`
                        <div class="alert alert-success">
                            ${data}
                        </div>
                    `);
                }
            });
        }
    });
});