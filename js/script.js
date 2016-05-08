(function(window, document, $) {

	window.addEventListener('load',init)
	var dom = null;

	function init() {
		initDom();
		initAutoCompletion();		
	}	


	function initDom() {
		dom = {
			input: document.getElementById('term'),
			error: document.getElementById('error'),
			list:  document.getElementsByTagName('ul')[0]
		}
	}

	function initAutoCompletion() {
		var source =  Rx.Observable
						.fromEvent(dom.input,'keyup')
						.map(function(e) { return e.target.value})
						.filter(function(val) { return val.length > 2})
						.debounce(300)


		var disposable = source.subscribe(function(val) {
			AjaxWikipedia(val);
		});		
	}

	function AjaxWikipedia(term) {	

		dom.error.setAttribute('hidden', true);

		while(dom.list.firstChild) {
			dom.list.removeChild(dom.list.firstChild);
		}

		var promise = $.ajax({
			url: 'https://en.wikipedia.org/w/api.php',
			dataType: 'jsonp',
			type: 'GET',
	     	data: {
	     	  action: 'opensearch',
	     	  format: 'json',
	     	  search: term
	     	}
		});


		try{
			var source = Rx.Observable
						 .fromPromise(promise)
						 .map(function(data) {return data[1]})
						 .filter(function(result) { return !!result.length });


			source.subscribe(
				function onNext (data) {
					
					var length = data.length;

					for( var i=0; i< length; i++) {
						var ele = document.createElement('li');
						ele.innerHTML = data[i];
						dom.list.appendChild(ele);					
					}
				},

				function onError(error) {
					dom.error.removeAttribute('hidden');
				}
			)

		}catch(e) {
			dom.error.removeAttribute('hidden');
			console.error(e.message);
		}
		
	}

}(window, document, jQuery))