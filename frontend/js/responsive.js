///
/// This is code to make it look pretty on different platforms

"use strict";

$("#responsive-panel").click(() => {

	//Responsive.shrinkRightPanel();

});

// I love namespaces

let Responsive = {

	calcColumnWidths: () => {

		const leftWidth = $(".left-column").width();
		const rightWidth = $(".right-column").width();

		return {
			left: leftWidth,
			right: rightWidth
		}

	},

	shrinkRightPanel: () => {

		// dynamically get widths of left/right columns.
		const colWidths = Responsive.calcColumnWidths();


		$(".left-column").addClass("big-left");
		$(".right-column").addClass("little-right");

		$(".responsive-switch").addClass("mini-switch");


	}

}