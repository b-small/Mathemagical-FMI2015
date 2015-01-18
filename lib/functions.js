$(document).ready(function() {
  if($('#image-slider > ul > li').length > 1) {
    $('#image-slider > ul').cycle({
      'fx': 'scrollHorz',
      'timeout': 6000,
      'speed': 600,
      'prev': '#image-slider .prev',
      'next': '#image-slider .next'
    });
  }
});

function clearInput(i) {
  if(i.value == i.defaultValue) {
    i.value = '';
  }
}

function restoreInput(i) {
  if(i.value == '') {
    i.value = i.defaultValue;
  }
}
