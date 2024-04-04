google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(drawChart);
function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Velocidad'],
        [12.2],
        [9.1],
        [12.2],
        [22.9],
        [0.9],
        [36.6],
        [9.1],
        [30.5],
        [6.1],
        [2.7],
        [0.9],
        [2.7],
        [27.1],
        [3.4],
        [5.5],
        [21.0],
        [7.9],
        [1.2],
        [4.6],
        [1.5],
        [7.9],
        [2.0],
        [45.7],
        [12.2],
        [30.5],
        [15.2],
        [30.5],
        [1.8]]);

    var options = {
        title: 'Velocidades en km/h',
        legend: { position: 'none' },
    };

    var chart = new google.visualization.Histogram(document.getElementById('chart_div'));
    chart.draw(data, options);
}