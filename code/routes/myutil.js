var logger = require("tracer").colorConsole({
	dateformat:"isoDateTime",
});

exports.debug = logger.debug;
exports.info = logger.info;
exports.warn = logger.warn;
exports.error = logger.error;
exports.log = logger.log;