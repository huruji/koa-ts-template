import Mov from '../src/index'
Mov.init({
  pid: 99,
  debug: true
})

referenceError
function fn() {
  console.logg()
}

fn()

// URIError
// function fn2() {
//   decodeURI('%')
// }
// fn2()

// RangeError
// function fn3() {
//   new Array(-1)
// }
// fn3()


// typeError
// function fn4() {
//   const a = 'name'
//   a.push(4)
// }
// fn4()

// failed to load resource


// window.addEventListener('error', (...arg) => {
// console.log('8888')
// console.log(...arg)
// }, true)

function fn5() {
  const img = new Image()
  img.src = window.location.href + '.gif'
}



fn5()
