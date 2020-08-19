//remove errors
function removeErrors() {
  $('form.login p.error, form.register p.error').remove();
  $('form.login input, form.register input').removeClass('error');
}

//Переключение блока Вход и Регистрация
$('.switch-button').on('click', function(e) {
  e.preventDefault();

  $('input').val('');
  removeErrors();

  $('.register').toggleClass('key');
  $('.login').toggleClass('key');
});

/*var a = document.getElementsByClassName('switch-button');

a[0].addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector('.register').classList.toggle("key");
  document.querySelector('.login').classList.toggle("key");
});
a[1].addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector('.register').classList.toggle("key");
  document.querySelector('.login').classList.toggle("key");
});
*/
//сброс error-ов
$('form.login input, form.register input').on('focus', function() {
  removeErrors();
});
/*document.getElementsByClassName('auth')[0].onclick = (e) => {
  var b = document.querySelector('.register');
  if(b.getElementsByTagName('p').length > 0) {
    b.removeChild(b.children[1]);
  }
  var a = b.getElementsByTagName('input');
  for(var i = 0; i < a.length ; i++ ) {
    a[i].classList.remove('error');
  };
};*/


//Отправка данных на регистрацию
document.querySelector('.register-button').addEventListener("click", (e) => {
  removeErrors();
  e.preventDefault();

  var data = {
    login: document.getElementById('register-login').value,
    password: document.getElementById('register-password').value,
    passwordConfirm: document.getElementById('register-password-confirm').value
  };
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/auth/register', true);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.onload = function() {
    var res = JSON.parse(xhr.response);
    if(xhr.readyState == 4 && xhr.status == 200) {
      //выводидим сообщение об ошибке
      var a = document.querySelector('.register').children;
      var er = document.createElement('p');
      if(!res.ok) {
        er.className = 'error';
        er.innerHTML = `${res.error}`;
        document.querySelector('.register').insertBefore(er, a[1]);
        //подсвечиваем поля с ошибками
        if(res.fields) {
          res.fields.forEach((item) => {
            var a = document.querySelector('.register').getElementsByTagName('input');
            for(var i = 0; i < a.length ; i++ ) {
              if(a[i].getAttribute('name') == item) {
                a[i].classList.toggle('error');
              } else {continue;}
            };
            //a.getElementsByName('name').classList.toggle("error");
          });
        }
      } else {
        //выводим сообшение все хорошо
        er.className = 'success';
        er.innerHTML = "Отлично!";
        document.querySelector('.register').insertBefore(er, a[1]);
        $(location).attr('href', '/');
      }
    }
    
  }
  xhr.send(JSON.stringify(data));
});

//Отправка данных на авторизацию
$('.login-button').on('click', (e) => {
  removeErrors();
  e.preventDefault();

  data = {
    login: $('#login-login').val(),
    password: $('#login-password').val(),
  };

  $.ajax({
    type: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json',
    url: '/api/auth/login'
  }).done(function(data) {
    if(!data.ok) {
      $('.login h2').after('<p class="error">' + data.error + '</p>');
      if(data.fields) {
        data.fields.forEach(function(item) {
          $('input[name=' + item + ']').addClass('error');
        });
      }
    } else {
      //$('.login h2').after('<p class="success">Отлично!</p>')
      $(location).attr('href', '/');
    }
  });
});
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