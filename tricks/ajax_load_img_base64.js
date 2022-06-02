getMedia() {
	let that = this;
	AjaxComponent.changeCursor(true);

	that.jqXHR = $.ajax({
		type: "GET",
		url: that.url,
		beforeSend: function (xhr) {
			xhr.overrideMimeType('text/plain; charset=x-user-defined');
		},
		success: function (result, textStatus, jqXHR) {
			let binary = "";
			const responseText = jqXHR.responseText;
			const responseTextLen = responseText.length;

			for (let i = 0; i < responseTextLen; i++) {
				binary += String.fromCharCode(responseText.charCodeAt(i) & 255)
			}
			that.$htmlElement.html('<body><img id="media" src={""} /></body>');
			$("#media").attr("src", "data:image/png;base64," + window.btoa(binary));
			AjaxComponent.changeCursor(false);
			that.onSuccessCallback(html);
		},
		error: function (status) {
			AjaxComponent.changeCursor(false);
			that.onFailCallback(status);
		}
	});
	return that;
}