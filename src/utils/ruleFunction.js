export const isPath = (rule, value, callback) => {
  const theIndex = value.indexOf('/')
  if (theIndex !== 0) {
    callback(new Error('请输入正确的Path以/开头'))
  } else {
    callback()
  }
}

