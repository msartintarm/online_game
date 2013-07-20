function determine_error(the_error) {
    
    var error_element = document.getElementById("the_error");
    
    switch(the_error) {
    case 0:   //GL_INIT
	error_element.innerHTML = "Whoops - cannot create a scene."; break;
    default:  //SHADER_INIT 
	error_element.innerHTML = "Whoops - shader compilation failed."; break;
    }

    // window will close after 5 seconds.
    var close_down = 5;
    document.getElementById("timer").innerHTML += " " + close_down + "...<br/>";
    window.resizeTo(window.outerWidth, window.outerHeight + 40);
    setInterval(function() {
	close_down -= 1;
	if (close_down > 0) {	
	    document.getElementById("timer").innerHTML += " " + close_down + "...<br/>";
	    window.resizeTo(window.outerWidth, window.outerHeight + 19);
	} else {
	    window.close();
	}
    }, 1000);


}
