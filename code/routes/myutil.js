var logger = require("tracer").colorConsole({
	dateformat:"isoDateTime",
});

exports.debug = logger.debug;
exports.info = logger.info;
exports.warn = logger.warn;
exports.error = logger.error;
exports.log = logger.log;

exports.latlng_parse = function(m_latlng){
	var latlng_str = m_latlng.replace("(", "").replace(")", "").split(",");
    var lat = parseFloat(latlng_str[0]);
    var lng = parseFloat(latlng_str[1]);
    var m_latlng = new google.maps.LatLng(lat, lng);
    return m_latlng
}