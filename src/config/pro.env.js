// 生产环境
module.exports = {
    NODE_ENV: '"production"',
    baseurl: location.protocol + "//" + location.host,
    baseVncWsUrl: "ws://" + location.host.replace(":8888", "") + ":6080",
};
