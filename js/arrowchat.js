try {
	//
	var file = document.createElement("link");
	file.setAttribute("href", "arrowchat/external.php?type=css");
	file.setAttribute("id", "arrowchat_css");
	file.setAttribute("media", "all");
	file.setAttribute("rel", "stylesheet");
	file.setAttribute("type", "text/css");
	document.getElementsByTagName("head")[0].appendChild(file);

	//
	var file = document.createElement("link");
	file.setAttribute("href", "arrowchat/public/list/css/style.css");
	file.setAttribute("id", "arrowchat_css");
	file.setAttribute("media", "all");
	file.setAttribute("rel", "stylesheet");
	file.setAttribute("type", "text/css");
	document.getElementsByTagName("head")[0].appendChild(file);

	//
	var ac_max_results = 0;

	//
	var file = document.createElement("script");
	file.setAttribute("charset", "utf-8");
	file.setAttribute("src", "arrowchat/public/list/js/list_core.js");
	file.setAttribute("type", "text/javascript");
	document.getElementsByTagName("head")[0].appendChild(file);

} catch (error) { console.log(error); }