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