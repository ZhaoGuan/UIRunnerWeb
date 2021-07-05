import { Notification } from 'element-ui'

export function alertMessage(title, content) {
  Notification.error({
    title: title,
    message: content
  })
}

export function message(title, content) {
  Notification.info({
    title: title,
    message: content
  })
}
