/* Some code derived from examples found on http://code.shutterstock.com/rickshaw/
*/

function updateGraph() {

	scoreData.pop[gameObject.contentCount].y = gameObject.gameScore.pop;
	scoreData.econ[gameObject.contentCount].y = gameObject.gameScore.econ;
	scoreData.rep[gameObject.contentCount].y = gameObject.gameScore.rep;
	scoreData.sol[gameObject.contentCount].y = gameObject.gameScore.sol;
	
	
	gameObject.contentCount++;
	
	drawLegend();
	
	graph.update();

}


function drawGraph() {
	
	$('#chart_container').html(
	'<div id="chart"></div><div id="x_axis"></div><div id="legend"></div>'
	);	

	scoreData = {
		"pop":[{x:0, y:null},{x:1, y:null},{x:2, y:null},{x:3, y:null},{x:4, y:null},{x:5, y:null},{x:6, y:null},{x:7, y:null},{x:8, y:null},{x:9, y:null},{x:10, y:null},{x:11, y:null},{x:12, y:null},{x:13, y:null},{x:14, y:null},{x:15, y:null},{x:16, y:null},{x:17, y:null},{x:18, y:null},{x:19, y:null},{x:20, y:null},{x:21, y:null},{x:22, y:null},{x:23, y:null},{x:24, y:null},{x:25, y:null},{x:26, y:null},{x:27, y:null},{x:28, y:null},{x:29, y:null},{x:30, y:null}], 
		"rep":[{x:0, y:null},{x:1, y:null},{x:2, y:null},{x:3, y:null},{x:4, y:null},{x:5, y:null},{x:6, y:null},{x:7, y:null},{x:8, y:null},{x:9, y:null},{x:10, y:null},{x:11, y:null},{x:12, y:null},{x:13, y:null},{x:14, y:null},{x:15, y:null},{x:16, y:null},{x:17, y:null},{x:18, y:null},{x:19, y:null},{x:20, y:null},{x:21, y:null},{x:22, y:null},{x:23, y:null},{x:24, y:null},{x:25, y:null},{x:26, y:null},{x:27, y:null},{x:28, y:null},{x:29, y:null},{x:30, y:null}], 
		"econ":[{x:0, y:null},{x:1, y:null},{x:2, y:null},{x:3, y:null},{x:4, y:null},{x:5, y:null},{x:6, y:null},{x:7, y:null},{x:8, y:null},{x:9, y:null},{x:10, y:null},{x:11, y:null},{x:12, y:null},{x:13, y:null},{x:14, y:null},{x:15, y:null},{x:16, y:null},{x:17, y:null},{x:18, y:null},{x:19, y:null},{x:20, y:null},{x:21, y:null},{x:22, y:null},{x:23, y:null},{x:24, y:null},{x:25, y:null},{x:26, y:null},{x:27, y:null},{x:28, y:null},{x:29, y:null},{x:30, y:null}], 
		"sol":[{x:0, y:null},{x:1, y:null},{x:2, y:null},{x:3, y:null},{x:4, y:null},{x:5, y:null},{x:6, y:null},{x:7, y:null},{x:8, y:null},{x:9, y:null},{x:10, y:null},{x:11, y:null},{x:12, y:null},{x:13, y:null},{x:14, y:null},{x:15, y:null},{x:16, y:null},{x:17, y:null},{x:18, y:null},{x:19, y:null},{x:20, y:null},{x:21, y:null},{x:22, y:null},{x:23, y:null},{x:24, y:null},{x:25, y:null},{x:26, y:null},{x:27, y:null},{x:28, y:null},{x:29, y:null},{x:30, y:null}]
	};
	
	
	graph = new Rickshaw.Graph({
		element: document.querySelector("#chart"),
		renderer: 'lineplot',
		series: [
		{
			data: scoreData.pop,
			name: 'Population',
			color: '#4682b4'
		}, {
			data: scoreData.econ,
			name: 'Economy',
			color: '#9cc1e0'
		}, {
			data: scoreData.rep,
			name: 'Reputation',
			color: '#22f1e0'
		}, {
			data: scoreData.sol,
			name: 'Solidarity',
			color: '#1e0992'
		}]
	});
	
	var format = function(n) {

		var map = {
			0: '1910',
			1: '',
			2: '',
			3: '1919',
			4: '',
			5: '',
			6: '1937',
			7: '',
			8: '',
			9: '1946',
			10: '',
			11: '',
			12: '1956',
			13: '',
			14: '',
			15: '1965',
			16: '',
			17: '',
			18: '1976',
			19: '',
			20: '',
			21: '1986',
			22: '',
			23: '',
			24: '1996',
			25: '',
			26: '',
			27: '2005',
			28: '',
			29: '',
			30: 'Present',
		};

		return map[n];
	}
	
	var x_axis = new Rickshaw.Graph.Axis.X( { 
		graph: graph,
		orientation: 'bottom',
		element: document.getElementById('x_axis'),
		tickFormat: format				
	} );		

	x_axis.render();									

}

function drawLegend() {

	var legend = document.querySelector('#legend');

	var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {

		render: function(args) {

			legend.innerHTML = "";

			args.detail.sort(function(a, b) { return a.order - b.order }).forEach( function(d) {

				var line = document.createElement('div');
				line.className = 'line';

				var swatch = document.createElement('div');
				swatch.className = 'swatch';
				swatch.style.backgroundColor = d.series.color;

				var label = document.createElement('div');
				label.className = 'label';
				if (d.value.y != null) {
					label.innerHTML = d.name + ": " + d.value.y;
				} else {
					label.innerHTML = d.name + ": " + d.series.data[gameObject.contentCount-1].y;
				}

				line.appendChild(swatch);
				line.appendChild(label);

				legend.appendChild(line);

				var dot = document.createElement('div');
				dot.className = 'dot';
				dot.style.top = graph.y(d.value.y0 + d.value.y) + 'px';
				dot.style.borderColor = d.series.color;
				
				if (d.value.y != null) {
					this.element.appendChild(dot);
				}

				dot.className = 'dot active';

				this.show();

			}, this );
		}
	});

	var hover = new Hover( { graph: graph } ); 
}