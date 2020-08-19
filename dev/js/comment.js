$(function() {
  var commentForm = $('.comment').clone(true, true);
  var parentId;
  
  //add form
  function form(isNew, comment) {
    $('.reply').show();
    if(commentForm) {
      commentForm.remove();
    }
    parentId = null;
   
    if(isNew) {
      commentForm.find('.cancel').hide();
      commentForm.appendTo('.comment-list');
    } else {
      var parentComment = $(comment).parent();
      parentId = parentComment.attr('id');
      console.log(parentId);
      $(comment).after(commentForm);
    }
    commentForm.css({display: 'flex'});
  };

  //load
  form(true);

  $('.reply').on('click', function() {
    console.log('Ess');
    form(false, this);
    $(this).hide();
  });

  $('form.comment .cancel').on('click', (e) => {
    e.preventDefault();
    commentForm.remove();
    form(true);
    console.log('ho');
  });

  //publish_comments
  $('form.comment .send').on('click', (e) => {
    //removeErrors(); 
    e.preventDefault();
    console.log('test');
    
    var data = {
      post: $('.comments').attr('id'),
      body: commentForm.find('textarea').val(),
      parent: parentId
    };
    console.log(data);

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/comment/add'
    }).done(function(data) {
      console.log(data);
      if(!data.ok) {
        if(data.error === undefined) {
          data.error = 'Неизвестная ошибка!';
        }
        $(commentForm).prepend('<p class="error">' + data.error + '</p>');
      } else {
        var newComment = '<ul><li><div class="head"><a href="/users/'+ data.login +'">'+ data.login +'</a><span class="date">Только что</span></div>'+ data.body +'</li></ul>';
        $(commentForm).after(newComment);
        form(true);
      }
    });
  });
});