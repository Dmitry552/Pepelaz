// eslint-desable-next-line
$(function(){
  

  //remove errors
  function removeErrors() {
    $('.post-forms p.error').remove();
    $('.post-forms input, #post-body').removeClass('error');
  }

  //crear
  $('post-form input, #post-body').on('focus', function() {
    removeErrors();
  });

  
  //publish 
  $('.publish-button, .save-button').on('click', (e) => {
    removeErrors();
    e.preventDefault();
    var isDraft = e.target.getAttribute('class').split(' ')[0] === 'save-button';

    console.log(isDraft);
  
    var data = {
      title: $('#post-title').val(),
      body: $('#post-body').val(),
      isDraft: isDraft,
      postId: $('#post-id').val(),
    };

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/post/add'
    }).done(function(data) {
      console.log(data);
      if(!data.ok) {
        $('.post-form h2').after('<p class="error">' + data.error + '</p>');
        if(data.fields) {
          data.fields.forEach(function(item) {
            $('#post-' + item).addClass('error');
          });
        }
      } else {
        //$('.login h2').after('<p class="success">Отлично!</p>')
        //$(location).attr('href', '/');
        if(isDraft) {
          $(location).attr('href', '/post/edit/' + data.post.id);
        } else {
          $(location).attr('href', '/posts/' + data.post.url);
        }
      }
    });
  });

  //upload
  $('#file').on('change', () => {
    //e.preventDefault();

    var formdata = document.forms.fileInfo;
    
    var formData = new FormData();
    formData.append('postId', $('#post-id').val());
    formData.append('file', $('#file')[0].files[0]);

    $.ajax({
      type: 'POST',
      url: '/upload/image',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data) {
        console.log(data);
        $('#fileinfo').prepend('<div class="img-container"><img src="/uploads' 
        + data.filePath 
        +'" alt=""></div>')
      },
      error: function(e) {
        console.log(e); 
      }
    });
  });
  // inserting image
  $(".img-container").on('click', (e) => {
    var imageId = e.getAttribute('#id');
    var txt = $("#post-body");
    var caretPos = txt[0].selectionStart;
    var textAreaText = txt.val();
    var txtToAdd = `![alt text](image ${imageId} )`;
    txt.val(textAreaText.subsring(0, caretPos) + txtToAdd + 
    textAreaText.subsring(caretPos));
  });
});
