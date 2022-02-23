function mk_freq_scale()
{
	//clear the lower part of the canvas (where frequency scale resides; the upper part is used by filter envelopes):
	g_range = get_visible_freq_range();
	mkenvelopes(g_range); //when scale changes we will always have to redraw filter envelopes, too

	scale_ctx.clearRect(0,22,scale_ctx.canvas.width,scale_ctx.canvas.height-22);
	scale_ctx.strokeStyle = "#fff";
	scale_ctx.font = "bold 12px sans-serif";
	scale_ctx.textBaseline = "top";
	scale_ctx.fillStyle = "#fff";
	
	var spacing = get_scale_mark_spacing(g_range);
	//console.log(spacing);
	//marker_hz = Math.ceil(g_range.start/spacing.smallbw) * spacing.smallbw; remove Math.ceil
	marker_hz = (g_range.start/spacing.smallbw) * spacing.smallbw;
	text_y_pos = 22+10 + (kiwi_isFirefox()? 3:0);
	var text_to_draw;
	
	var ftext = function(f) {
		var pre_divide = spacing.params.pre_divide;
		var decimals = spacing.params.decimals;
		f += cfg.freq_offset*1e3;
		if (f < 1e6) {
			pre_divide /= 1000;
			decimals = 0;
		}
		text_to_draw = format_frequency(spacing.params.format+((f < 1e6)? 'kHz':'MHz'), f, pre_divide, decimals);
	}
	
	var last_large;
   var conv_ct=0;

	for (;;) {
      conv_ct++;
      if (conv_ct > 1000) break;
		var x = scale_px_from_freq(marker_hz, g_range);
		if (x > window.innerWidth) break;
		scale_ctx.beginPath();		
		scale_ctx.moveTo(x, 22);

		if (marker_hz % spacing.params.hz_per_large_marker == 0) {

			//large marker
			if (isUndefined(first_large)) var first_large = marker_hz; 
			last_large = marker_hz;
			scale_ctx.lineWidth = 3.5;
			scale_ctx.lineTo(x,22+11);
			ftext(marker_hz);
			var text_measured = scale_ctx.measureText(text_to_draw);
			scale_ctx.textAlign = "center";

			//advanced text drawing begins
			//console.log('text_to_draw='+ text_to_draw);
			if (zoom_level==0 && g_range.start+spacing.smallbw*spacing.ratio > marker_hz) {

				//if this is the first overall marker when zoomed all the way out
				//console.log('case 1');
				if (x < text_measured.width/2) {
				   //and if it would be clipped off the screen
					if (scale_px_from_freq(marker_hz+spacing.smallbw*spacing.ratio, g_range)-text_measured.width >= scale_min_space_btwn_texts) {
					   //and if we have enough space to draw it correctly without clipping
						scale_ctx.textAlign = "left";
						scale_ctx.fillText(text_to_draw, 0, text_y_pos); 
					}
				}
			} else
			
			if (zoom_level==0 && g_range.end-spacing.smallbw*spacing.ratio < marker_hz) {

			   //if this is the last overall marker when zoomed all the way out
				//console.log('case 2');
				if (x > window.innerWidth-text_measured.width/2) {
				   //and if it would be clipped off the screen
					if (window.innerWidth-text_measured.width-scale_px_from_freq(marker_hz-spacing.smallbw*spacing.ratio, g_range) >= scale_min_space_btwn_texts) {
					   //and if we have enough space to draw it correctly without clipping
						scale_ctx.textAlign = "right";
						scale_ctx.fillText(text_to_draw, window.innerWidth, text_y_pos); 
					}	
				} else {
					// last large marker is not the last marker, so draw normally
					scale_ctx.fillText(text_to_draw, x, text_y_pos);
				}
			} else {
			   //draw text normally
				//console.log('case 3');
				scale_ctx.fillText(text_to_draw, x, text_y_pos);
			}
		} else {
		
			//small marker
			scale_ctx.lineWidth = 2;
			scale_ctx.lineTo(x,22+8);
		}
		
		marker_hz += spacing.smallbw;
		scale_ctx.stroke();
	}

   if (conv_ct > 1000) { console.log("CONV_CT > 1000!!!"); kiwi_trace(); }

	if (zoom_level != 0) {	// if zoomed, we don't want the texts to disappear because their markers can't be seen
		// on the left side
		scale_ctx.textAlign = "center";
		var f = first_large-spacing.smallbw*spacing.ratio;
		var x = scale_px_from_freq(f, g_range);
		ftext(f);
		var w = scale_ctx.measureText(text_to_draw).width;
		if (x+w/2 > 0) scale_ctx.fillText(text_to_draw, x, 22+10);

		// on the right side
		f = last_large+spacing.smallbw*spacing.ratio;
		x = scale_px_from_freq(f, g_range);
		ftext(f);
		w = scale_ctx.measureText(text_to_draw).width;
		if (x-w/2 < window.innerWidth) scale_ctx.fillText(text_to_draw, x, 22+10);
	}
}
