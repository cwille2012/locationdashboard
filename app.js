import React, { Component } from 'react';
import { render } from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';

import { csv as requestCsv } from 'd3-request';
import index from 'deck.gl';

const MAPBOX_TOKEN = "pk.eyJ1IjoiY3dpbGxlMjAxMiIsImEiOiJjajJxdWJyeXEwMDE5MzNydXF2cm1sbDU1In0.kCKIz6Ivh3EfNOmEfTANOA";

var socket = require('engine.io-client')('ws://ec2-18-220-229-176.us-east-2.compute.amazonaws.com:3002');

socket.on('open', function() {
    socket.on('message', function(data) {
        //console.log(data);
        var newData = String(data);
        if (newData.length > 500) {
            //first message
            newData = JSON.parse(newData);
            console.log(newData);

            //add data to table:
            var indexDataTableExists = !!document.getElementById('indexDataTable');
            if (indexDataTableExists) {
                var sumGasses = 0;
                var sumPm25 = 0;
                var sumPm10 = 0;
                var sumAqi = 0;
                for (var i in newData) {
                    var timeStamp = parseInt(newData[i]['_id'].toString().substr(0, 8), 16) * 1000;
                    timeStamp = new Date(timeStamp);
                    timeStamp = String(timeStamp);
                    timeStamp = timeStamp.replace(/GMT-0500/g, '');
                    timeStamp = timeStamp.replace(/EST/g, '');
                    timeStamp = timeStamp.replace(/"/g, "").replace(/'/g, "").replace(/\(|\)/g, "");
                    timeStamp = timeStamp.replace(/Sat/g, '');
                    timeStamp = timeStamp.replace(/Sun/g, '');
                    timeStamp = timeStamp.replace(/Mon/g, '');
                    timeStamp = timeStamp.replace(/Tue/g, '');
                    timeStamp = timeStamp.replace(/Wed/g, '');
                    timeStamp = timeStamp.replace(/Thu/g, '');
                    timeStamp = timeStamp.replace(/Fri/g, '');


                    var pm25 = Math.round(parseFloat(newData[i]['data']['pm25']) * 11.50 * 100) / 100;
                    var pm10 = Math.round(parseFloat(newData[i]['data']['pm10']) * 2.41 * 100) / 100;
                    var mq2 = newData[i]['data']['mq2'];
                    var mq3 = newData[i]['data']['mq3'];
                    var mq4 = newData[i]['data']['mq4'];
                    var mq5 = newData[i]['data']['mq5'];
                    var temp = newData[i]['data']['temperature'];
                    var hum = newData[i]['data']['humidity'];
                    //var long = newData[i]['pos']['lon'];
                    //var lat = newData[i]['pos']['lat'];

                    //var particulates = Math.round(((pm25 + pm10) / 2) * 100) / 100;
                    var gasses = Math.round(((mq2 + mq3 + mq4 + mq5) / 4) * 100) / 100;

                    var aqi = pm10;
                    if (pm25 > aqi) {
                        aqi = pm25;
                    }
                    if (gasses > aqi) {
                        aqi = gasses;
                    }

                    sumGasses += gasses;
                    sumPm10 += pm10;
                    sumPm25 += pm25;
                    sumAqi += aqi;

                    var tr = document.createElement("tr");

                    var td0 = document.createElement("td");
                    var text0 = document.createTextNode(timeStamp);
                    td0.setAttribute("id", i + '-time');
                    td0.appendChild(text0);
                    tr.appendChild(td0);

                    var td1 = document.createElement("td");
                    var text1 = document.createTextNode(String(pm25));
                    td1.setAttribute("id", i + '-pm25');
                    td1.appendChild(text1);
                    tr.appendChild(td1);

                    var td6 = document.createElement("td");
                    var text6 = document.createTextNode(String(pm10));
                    td6.setAttribute("id", i + '-pm10');
                    td6.appendChild(text6);
                    tr.appendChild(td6);

                    var td2 = document.createElement("td");
                    var text2 = document.createTextNode(String(gasses));
                    td2.setAttribute("id", i + '-particulates');
                    td2.appendChild(text2);
                    tr.appendChild(td2);

                    var td4 = document.createElement("td");
                    var text4 = document.createTextNode(String(aqi));
                    td4.setAttribute("id", i + '-aqi');
                    td4.appendChild(text4);
                    tr.appendChild(td4);

                    document.getElementById('indexDataTableBody').appendChild(tr);
                }
                var avgGasses = sumGasses / i;
                var avgPm10 = sumPm10 / i;
                var avgPm25 = sumPm25 / i;
                var avgAqi = sumAqi / i;
                console.log('Average AQI: ' + avgAqi);

                if (!!document.getElementById('averagePm25')) {
                    document.getElementById('averagePm25').innerHTML = parseInt(avgPm25);
                }
                if (!!document.getElementById('averagePm10')) {
                    document.getElementById('averagePm10').innerHTML = parseInt(avgPm10);
                }
                if (!!document.getElementById('averageOzone')) {
                    document.getElementById('averageOzone').innerHTML = parseInt(avgGasses);
                }

            }
            //add data to area chart:
            var indexAreaChartExists = !!document.getElementById('myAreaChart');
            if (indexAreaChartExists) {
                var labelArray = new Array();
                var pm25Array = new Array();
                var pm10Array = new Array();
                var gasArray = new Array();
                var aqiArray = new Array();

                var timeInterval = parseInt((newData.length - 1) / 7);

                for (var i in newData) {
                    var timeStampShort = parseInt(newData[i]['_id'].toString().substr(0, 8), 16) * 1000;
                    timeStampShort = new Date(timeStampShort);
                    timeStampShort = String(timeStampShort);
                    timeStampShort = timeStampShort.replace(/GMT-0500/g, '');
                    timeStampShort = timeStampShort.replace(/EST/g, '');
                    timeStampShort = timeStampShort.replace(/"/g, "").replace(/'/g, "").replace(/\(|\)/g, "");
                    timeStampShort = timeStampShort.replace(/Sat/g, '');
                    timeStampShort = timeStampShort.replace(/Sun/g, '');
                    timeStampShort = timeStampShort.replace(/Mon/g, '');
                    timeStampShort = timeStampShort.replace(/Tue/g, '');
                    timeStampShort = timeStampShort.replace(/Wed/g, '');
                    timeStampShort = timeStampShort.replace(/Thu/g, '');
                    timeStampShort = timeStampShort.replace(/Fri/g, '');
                    timeStampShort = timeStampShort.replace(/2018 /g, '');
                    timeStampShort = timeStampShort.replace(/Jan /g, '1/');
                    timeStampShort = timeStampShort.replace(/Feb /g, '2/');
                    timeStampShort = timeStampShort.replace(/Mar /g, '3/');
                    timeStampShort = timeStampShort.replace(/Apr /g, '4/');
                    timeStampShort = timeStampShort.replace(/May /g, '5/');
                    timeStampShort = timeStampShort.replace(/Jun /g, '6/');
                    timeStampShort = timeStampShort.replace(/Jul /g, '7/');
                    timeStampShort = timeStampShort.replace(/Aug /g, '8/');
                    timeStampShort = timeStampShort.replace(/Sep /g, '9/');
                    timeStampShort = timeStampShort.replace(/Oct /g, '10/');
                    timeStampShort = timeStampShort.replace(/Nov /g, '11/');
                    timeStampShort = timeStampShort.replace(/Dec /g, '12/');
                    timeStampShort = timeStampShort.split(':');
                    timeStampShort = String(timeStampShort[0] + ':' + timeStampShort[1]);

                    var mq2 = newData[i]['data']['mq2'];
                    var mq3 = newData[i]['data']['mq3'];
                    var mq4 = newData[i]['data']['mq4'];
                    var mq5 = newData[i]['data']['mq5'];

                    if ((i == timeInterval) || (i == timeInterval * 7) || (i == timeInterval * 2) || (i == timeInterval * 3) || (i == timeInterval * 4) || (i == timeInterval * 5) || (i == timeInterval * 6)) {
                        labelArray.push(timeStampShort);
                        pm25Array.push(Math.round(parseFloat(newData[i]['data']['pm25']) * 11.50 * 100) / 100);

                        var pm10Val = Math.round(parseFloat(newData[i]['data']['pm10']) * 2.41 * 100) / 100;
                        if (pm10Val > 21) {
                            pm10Val = Math.round((pm10Val - 10.00) * 100) / 100;
                        }

                        var aqi = pm10Val;
                        if ((Math.round(parseFloat(newData[i]['data']['pm25']) * 11.50 * 100) / 100) > aqi) {
                            aqi = (Math.round(parseFloat(newData[i]['data']['pm25']) * 11.50 * 100) / 100);
                        }
                        if ((Math.round(((mq2 + mq3 + mq4 + mq5) / 4) * 100) / 100) > aqi) {
                            aqi = (Math.round(((mq2 + mq3 + mq4 + mq5) / 4) * 100) / 100);
                        }

                        aqiArray.push(aqi);

                        pm10Array.push(pm10Val);
                        gasArray.push(Math.round(((mq2 + mq3 + mq4 + mq5) / 4) * 100) / 100);
                    }

                    if (labelArray.length > 7) {
                        labelArray.shift();
                    }
                    if (pm25Array.length > 7) {
                        pm25Array.shift();
                    }
                    if (pm10Array.length > 7) {
                        pm10Array.shift();
                    }
                    if (gasArray.length > 7) {
                        gasArray.shift();
                    }
                    if (aqiArray.length > 7) {
                        aqiArray.shift();
                    }
                }

                var ctx = document.getElementById("myAreaChart");
                var myLineChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labelArray,
                        datasets: [{
                                label: "PM25",
                                lineTension: 0.3,
                                backgroundColor: "rgba(255,193,7,0.2)",
                                borderColor: "rgba(255,193,7,1)",
                                pointRadius: 5,
                                pointBackgroundColor: "rgba(255,193,7,1)",
                                pointBorderColor: "rgba(255,255,255,0.8)",
                                pointHoverRadius: 5,
                                pointHoverBackgroundColor: "rgba(255,193,7,1)",
                                pointHitRadius: 20,
                                pointBorderWidth: 2,
                                data: pm25Array,
                            },
                            {
                                label: "PM10",
                                lineTension: 0.3,
                                backgroundColor: "rgba(40,167,69,0.2)",
                                borderColor: "rgba(40,167,69,1)",
                                pointRadius: 5,
                                pointBackgroundColor: "rgba(40,167,69,1)",
                                pointBorderColor: "rgba(255,255,255,0.8)",
                                pointHoverRadius: 5,
                                pointHoverBackgroundColor: "rgba(40,167,69,1)",
                                pointHitRadius: 20,
                                pointBorderWidth: 2,
                                data: pm10Array,
                            },
                            {
                                label: "Ozone",
                                lineTension: 0.3,
                                backgroundColor: "rgba(40,167,69,0.2)",
                                borderColor: "rgba(40,167,69,1)",
                                pointRadius: 5,
                                pointBackgroundColor: "rgba(40,167,69,1)",
                                pointBorderColor: "rgba(255,255,255,0.8)",
                                pointHoverRadius: 5,
                                pointHoverBackgroundColor: "rgba(40,167,69,1)",
                                pointHitRadius: 20,
                                pointBorderWidth: 2,
                                data: gasArray,
                            },
                        ],
                    },
                    options: {
                        scales: {
                            xAxes: [{
                                time: {
                                    unit: 'date'
                                },
                                gridLines: {
                                    display: false
                                },
                                ticks: {
                                    maxTicksLimit: 7
                                }
                            }],
                            yAxes: [{
                                ticks: {
                                    min: 0,
                                    maxTicksLimit: 5
                                },
                                gridLines: {
                                    color: "rgba(0, 0, 0, .125)",
                                }
                            }],
                        },
                        legend: {
                            display: false
                        }
                    }
                });
                var indexBarChartExists = !!document.getElementById('myBarChart');
                if (indexBarChartExists) {

                    var green = '#28a745';
                    var red = '#dc3545';
                    var yellow = '#ffc107';
                    var backgroundColorVar = '#28a745';
                    if (avgAqi > 50) {
                        backgroundColorVar = '#ffc107';
                    }
                    if (avgAqi > 100) {
                        backgroundColorVar = '#dc3545';
                    }


                    var ctx = document.getElementById("myBarChart");
                    var myLineChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: labelArray,
                            datasets: [{
                                label: "Overall AQI",
                                backgroundColor: backgroundColorVar,
                                borderColor: backgroundColorVar,
                                data: aqiArray,
                            }],
                        },
                        options: {
                            scales: {
                                xAxes: [{
                                    time: {
                                        unit: 'date'
                                    },
                                    gridLines: {
                                        display: false
                                    },
                                    ticks: {
                                        maxTicksLimit: 6
                                    }
                                }],
                                yAxes: [{
                                    ticks: {
                                        min: 0,
                                        maxTicksLimit: 5
                                    },
                                    gridLines: {
                                        display: true
                                    }
                                }],
                            },
                            legend: {
                                display: false
                            }
                        }
                    });
                }
            }

            //graph pm25 independant
            if (!!document.getElementById('pm25-graph')) {

                var datasets = new Object();

                var pm25Data = new Array();
                var pm10Data = new Array();
                var mq2Data = new Array();
                var mq3Data = new Array();
                var mq4Data = new Array();
                var mq5Data = new Array();
                var mq6Data = new Array();
                var mq7Data = new Array();

                //newData = JSON.parse(newData);

                for (var i in newData) {

                    var date = parseInt(newData[i]['_id'].toString().substr(0, 8), 16) * 1000;
                    date = new Date(date);
                    var time = new Date(date).getTime();

                    var pm25 = Math.round(parseFloat(newData[i]['data']['pm25']) * 11.50 * 100) / 100;
                    var pm10 = Math.round(parseFloat(newData[i]['data']['pm10']) * 2.41 * 100) / 100;
                    var mq2 = newData[i]['data']['mq2'];
                    var mq3 = newData[i]['data']['mq3'];
                    var mq4 = newData[i]['data']['mq4'];
                    var mq5 = newData[i]['data']['mq5'];
                    var mq6 = newData[i]['data']['mq6'];
                    var mq7 = newData[i]['data']['mq7'];
                    var temp = newData[i]['data']['temperature'];
                    var hum = newData[i]['data']['humidity'];

                    pm25Data.push([time, pm25]);
                    pm10Data.push([time, pm10]);
                    mq2Data.push([time, mq2]);
                    mq3Data.push([time, mq3]);
                    mq4Data.push([time, mq4]);
                    mq5Data.push([time, mq5]);
                    mq6Data.push([time, mq6]);
                    mq7Data.push([time, mq7]);

                    //console.log(time + " " + pm25);
                }

                var pm25Obj = { 'data': pm25Data, 'label': "Particles (PM2.5)", color: 1 };
                var pm10Obj = { 'data': pm10Data, 'label': "Particles (PM10)", color: 2 };
                var mq2Obj = { 'data': mq2Data, 'label': "Propane", color: 3 };
                var mq3Obj = { 'data': mq3Data, 'label': "Benzine", color: 4 };
                var mq4Obj = { 'data': mq4Data, 'label': "Methane", color: 5 };
                var mq5Obj = { 'data': mq5Data, 'label': "Hydrogen", color: 6 };
                var mq6Obj = { 'data': mq6Data, 'label': "Butane", color: 7 };
                var mq7Obj = { 'data': mq7Data, 'label': "Carbon Monoxide", color: 8 };

                datasets.pm25 = pm25Obj;
                datasets.pm10 = pm10Obj;
                datasets.mq2 = mq2Obj;
                datasets.mq3 = mq3Obj;
                datasets.mq4 = mq4Obj;
                datasets.mq5 = mq5Obj;
                datasets.mq6 = mq6Obj;
                datasets.mq7 = mq7Obj;

                console.log('Datasets: ');
                console.log(datasets);

                //end of formatting
                //graph stuff:

                var i = 0;
                $.each(datasets, function(key, val) {
                    val.color = i;
                    ++i;
                });

                var choiceContainer = $("#choices");
                $.each(datasets, function(key, val) {
                    if (key == 'pm25') { //dont forget to change here
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' checked='checked' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    } else {
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    }
                });

                choiceContainer.find("input").click(plotAccordingToChoices);

                function plotAccordingToChoices() {

                    var data = [];

                    choiceContainer.find("input:checked").each(function() {
                        var key = $(this).attr("name");
                        if (key && datasets[key]) {
                            data.push(datasets[key]);
                        }
                    });
                    var plot = $.plot("#pm25-graph", data, {
                        grid: {
                            hoverable: true,
                            clickable: true
                        },
                        series: {
                            lines: {
                                show: true
                            },
                            points: {
                                show: true
                            }
                        },
                        yaxis: {
                            min: 0
                        },
                        xaxis: {
                            mode: "time",
                            timeformat: "%m/%d/%y",
                            tickSize: [24, "hour"],
                            tickFormatter: function(val, axis) {
                                var date = (new Date((val)).getMonth() + 1) + "/" + (new Date(val)).getDate() + "/" + (new Date(val)).getUTCFullYear();
                                return date;
                            }
                        }
                    });


                    if (data.length > 0) {
                        var overview = $.plot("#sensor-values-time-overview", data, {
                            series: {
                                lines: {
                                    show: true,
                                    lineWidth: 1
                                },
                                shadowSize: 0
                            },
                            xaxis: {
                                ticks: [],
                                mode: "time"
                            },
                            yaxis: {
                                ticks: [],
                                min: 0,
                                autoscaleMargin: 0.1
                            },
                            selection: {
                                mode: "x"
                            },
                            legend: {
                                show: false
                            }
                        });
                    }

                    $("#pm25-graph").bind("plotselected", function(event, ranges) {

                        $.each(plot.getXAxes(), function(_, axis) {
                            var opts = axis.options;
                            opts.min = ranges.xaxis.from;
                            opts.max = ranges.xaxis.to;
                        });
                        plot.setupGrid();
                        plot.draw();
                        plot.clearSelection();

                        overview.setSelection(ranges, true);
                    });

                    $("#sensor-values-time-overview").bind("plotselected", function(event, ranges) {
                        plot.setSelection(ranges);
                    });

                    $("<div id='tooltip'></div>").css({
                        position: "absolute",
                        display: "none",
                        border: "1px solid #fdd",
                        padding: "2px",
                        "background-color": "#fee",
                        opacity: 0.80
                    }).appendTo("body");

                    $("#pm25-graph").bind("plothover", function(event, pos, item) {

                        if (true) {
                            if (item) {
                                var x = item.datapoint[0],
                                    y = item.datapoint[1].toFixed(2);

                                $("#tooltip").html(item.series.label + " on " + (new Date(x).getMonth() + 1) + "/" + (new Date(x)).getDate() + "/" + (new Date(x)).getUTCFullYear() + " was " + y)
                                    .css({ top: item.pageY + 5, left: item.pageX + 5 })
                                    .fadeIn(200);
                            } else {
                                $("#tooltip").hide();
                            }
                        }
                    });

                    $("#pm25-graph").bind("plotclick", function(event, pos, item) {
                        if (item) {
                            $("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
                            plot.highlight(item.series, item.datapoint);
                        }
                    });
                }
                plotAccordingToChoices();

            }

            //graph pm10 independant
            if (!!document.getElementById('pm10-graph')) {

                var datasets = new Object();

                var pm25Data = new Array();
                var pm10Data = new Array();
                var mq2Data = new Array();
                var mq3Data = new Array();
                var mq4Data = new Array();
                var mq5Data = new Array();
                var mq6Data = new Array();
                var mq7Data = new Array();

                //newData = JSON.parse(newData);

                for (var i in newData) {

                    var date = parseInt(newData[i]['_id'].toString().substr(0, 8), 16) * 1000;
                    date = new Date(date);
                    var time = new Date(date).getTime();

                    var pm25 = Math.round(parseFloat(newData[i]['data']['pm25']) * 11.50 * 100) / 100;
                    var pm10 = Math.round(parseFloat(newData[i]['data']['pm10']) * 2.41 * 100) / 100;
                    var mq2 = newData[i]['data']['mq2'];
                    var mq3 = newData[i]['data']['mq3'];
                    var mq4 = newData[i]['data']['mq4'];
                    var mq5 = newData[i]['data']['mq5'];
                    var mq6 = newData[i]['data']['mq6'];
                    var mq7 = newData[i]['data']['mq7'];
                    var temp = newData[i]['data']['temperature'];
                    var hum = newData[i]['data']['humidity'];

                    pm25Data.push([time, pm25]);
                    pm10Data.push([time, pm10]);
                    mq2Data.push([time, mq2]);
                    mq3Data.push([time, mq3]);
                    mq4Data.push([time, mq4]);
                    mq5Data.push([time, mq5]);
                    mq6Data.push([time, mq6]);
                    mq7Data.push([time, mq7]);

                    //console.log(time + " " + pm25);
                }

                var pm25Obj = { 'data': pm25Data, 'label': "Particles (PM2.5)", color: 1 };
                var pm10Obj = { 'data': pm10Data, 'label': "Particles (PM10)", color: 2 };
                var mq2Obj = { 'data': mq2Data, 'label': "Propane", color: 3 };
                var mq3Obj = { 'data': mq3Data, 'label': "Benzine", color: 4 };
                var mq4Obj = { 'data': mq4Data, 'label': "Methane", color: 5 };
                var mq5Obj = { 'data': mq5Data, 'label': "Hydrogen", color: 6 };
                var mq6Obj = { 'data': mq6Data, 'label': "Butane", color: 7 };
                var mq7Obj = { 'data': mq7Data, 'label': "Carbon Monoxide", color: 8 };

                datasets.pm25 = pm25Obj;
                datasets.pm10 = pm10Obj;
                datasets.mq2 = mq2Obj;
                datasets.mq3 = mq3Obj;
                datasets.mq4 = mq4Obj;
                datasets.mq5 = mq5Obj;
                datasets.mq6 = mq6Obj;
                datasets.mq7 = mq7Obj;

                console.log('Datasets: ');
                console.log(datasets);

                //end of formatting
                //graph stuff:

                var i = 0;
                $.each(datasets, function(key, val) {
                    val.color = i;
                    ++i;
                });

                var choiceContainer = $("#choices");
                $.each(datasets, function(key, val) {
                    if (key == 'pm10') { //dont forget to change here
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' checked='checked' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    } else {
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    }
                });

                choiceContainer.find("input").click(plotAccordingToChoices);

                function plotAccordingToChoices() {

                    var data = [];

                    choiceContainer.find("input:checked").each(function() {
                        var key = $(this).attr("name");
                        if (key && datasets[key]) {
                            data.push(datasets[key]);
                        }
                    });
                    var plot = $.plot("#pm10-graph", data, {
                        grid: {
                            hoverable: true,
                            clickable: true
                        },
                        series: {
                            lines: {
                                show: true
                            },
                            points: {
                                show: true
                            }
                        },
                        yaxis: {
                            min: 0
                        },
                        xaxis: {
                            mode: "time",
                            timeformat: "%m/%d/%y",
                            tickSize: [24, "hour"],
                            tickFormatter: function(val, axis) {
                                var date = (new Date((val)).getMonth() + 1) + "/" + (new Date(val)).getDate() + "/" + (new Date(val)).getUTCFullYear();
                                return date;
                            }
                        }
                    });


                    if (data.length > 0) {
                        var overview = $.plot("#sensor-values-time-overview", data, {
                            series: {
                                lines: {
                                    show: true,
                                    lineWidth: 1
                                },
                                shadowSize: 0
                            },
                            xaxis: {
                                ticks: [],
                                mode: "time"
                            },
                            yaxis: {
                                ticks: [],
                                min: 0,
                                autoscaleMargin: 0.1
                            },
                            selection: {
                                mode: "x"
                            },
                            legend: {
                                show: false
                            }
                        });
                    }

                    $("#pm10-graph").bind("plotselected", function(event, ranges) {

                        $.each(plot.getXAxes(), function(_, axis) {
                            var opts = axis.options;
                            opts.min = ranges.xaxis.from;
                            opts.max = ranges.xaxis.to;
                        });
                        plot.setupGrid();
                        plot.draw();
                        plot.clearSelection();

                        overview.setSelection(ranges, true);
                    });

                    $("#sensor-values-time-overview").bind("plotselected", function(event, ranges) {
                        plot.setSelection(ranges);
                    });

                    $("<div id='tooltip'></div>").css({
                        position: "absolute",
                        display: "none",
                        border: "1px solid #fdd",
                        padding: "2px",
                        "background-color": "#fee",
                        opacity: 0.80
                    }).appendTo("body");

                    $("#pm10-graph").bind("plothover", function(event, pos, item) {

                        if (true) {
                            if (item) {
                                var x = item.datapoint[0],
                                    y = item.datapoint[1].toFixed(2);

                                $("#tooltip").html(item.series.label + " on " + (new Date(x).getMonth() + 1) + "/" + (new Date(x)).getDate() + "/" + (new Date(x)).getUTCFullYear() + " was " + y)
                                    .css({ top: item.pageY + 5, left: item.pageX + 5 })
                                    .fadeIn(200);
                            } else {
                                $("#tooltip").hide();
                            }
                        }
                    });

                    $("#pm10-graph").bind("plotclick", function(event, pos, item) {
                        if (item) {
                            $("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
                            plot.highlight(item.series, item.datapoint);
                        }
                    });
                }
                plotAccordingToChoices();

            }

            //graph mq2 independant
            if (!!document.getElementById('mq2-graph')) {

                var datasets = new Object();

                var pm25Data = new Array();
                var pm10Data = new Array();
                var mq2Data = new Array();
                var mq3Data = new Array();
                var mq4Data = new Array();
                var mq5Data = new Array();
                var mq6Data = new Array();
                var mq7Data = new Array();

                //newData = JSON.parse(newData);

                for (var i in newData) {

                    var date = parseInt(newData[i]['_id'].toString().substr(0, 8), 16) * 1000;
                    date = new Date(date);
                    var time = new Date(date).getTime();

                    var pm25 = Math.round(parseFloat(newData[i]['data']['pm25']) * 11.50 * 100) / 100;
                    var pm10 = Math.round(parseFloat(newData[i]['data']['pm10']) * 2.41 * 100) / 100;
                    var mq2 = newData[i]['data']['mq2'];
                    var mq3 = newData[i]['data']['mq3'];
                    var mq4 = newData[i]['data']['mq4'];
                    var mq5 = newData[i]['data']['mq5'];
                    var mq6 = newData[i]['data']['mq6'];
                    var mq7 = newData[i]['data']['mq7'];
                    var temp = newData[i]['data']['temperature'];
                    var hum = newData[i]['data']['humidity'];

                    pm25Data.push([time, pm25]);
                    pm10Data.push([time, pm10]);
                    mq2Data.push([time, mq2]);
                    mq3Data.push([time, mq3]);
                    mq4Data.push([time, mq4]);
                    mq5Data.push([time, mq5]);
                    mq6Data.push([time, mq6]);
                    mq7Data.push([time, mq7]);

                    //console.log(time + " " + pm25);
                }

                var pm25Obj = { 'data': pm25Data, 'label': "Particles (PM2.5)", color: 1 };
                var pm10Obj = { 'data': pm10Data, 'label': "Particles (PM10)", color: 2 };
                var mq2Obj = { 'data': mq2Data, 'label': "Propane", color: 3 };
                var mq3Obj = { 'data': mq3Data, 'label': "Benzine", color: 4 };
                var mq4Obj = { 'data': mq4Data, 'label': "Methane", color: 5 };
                var mq5Obj = { 'data': mq5Data, 'label': "Hydrogen", color: 6 };
                var mq6Obj = { 'data': mq6Data, 'label': "Butane", color: 7 };
                var mq7Obj = { 'data': mq7Data, 'label': "Carbon Monoxide", color: 8 };

                datasets.pm25 = pm25Obj;
                datasets.pm10 = pm10Obj;
                datasets.mq2 = mq2Obj;
                datasets.mq3 = mq3Obj;
                datasets.mq4 = mq4Obj;
                datasets.mq5 = mq5Obj;
                datasets.mq6 = mq6Obj;
                datasets.mq7 = mq7Obj;

                console.log('Datasets: ');
                console.log(datasets);

                //end of formatting
                //graph stuff:

                var i = 0;
                $.each(datasets, function(key, val) {
                    val.color = i;
                    ++i;
                });

                var choiceContainer = $("#choices");
                $.each(datasets, function(key, val) {
                    if (key == 'mq2') { //dont forget to change here
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' checked='checked' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    } else {
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    }
                });

                choiceContainer.find("input").click(plotAccordingToChoices);

                function plotAccordingToChoices() {

                    var data = [];

                    choiceContainer.find("input:checked").each(function() {
                        var key = $(this).attr("name");
                        if (key && datasets[key]) {
                            data.push(datasets[key]);
                        }
                    });
                    var plot = $.plot("#mq2-graph", data, {
                        grid: {
                            hoverable: true,
                            clickable: true
                        },
                        series: {
                            lines: {
                                show: true
                            },
                            points: {
                                show: true
                            }
                        },
                        yaxis: {
                            min: 0
                        },
                        xaxis: {
                            mode: "time",
                            timeformat: "%m/%d/%y",
                            tickSize: [24, "hour"],
                            tickFormatter: function(val, axis) {
                                var date = (new Date((val)).getMonth() + 1) + "/" + (new Date(val)).getDate() + "/" + (new Date(val)).getUTCFullYear();
                                return date;
                            }
                        }
                    });


                    if (data.length > 0) {
                        var overview = $.plot("#sensor-values-time-overview", data, {
                            series: {
                                lines: {
                                    show: true,
                                    lineWidth: 1
                                },
                                shadowSize: 0
                            },
                            xaxis: {
                                ticks: [],
                                mode: "time"
                            },
                            yaxis: {
                                ticks: [],
                                min: 0,
                                autoscaleMargin: 0.1
                            },
                            selection: {
                                mode: "x"
                            },
                            legend: {
                                show: false
                            }
                        });
                    }

                    $("#mq2-graph").bind("plotselected", function(event, ranges) {

                        $.each(plot.getXAxes(), function(_, axis) {
                            var opts = axis.options;
                            opts.min = ranges.xaxis.from;
                            opts.max = ranges.xaxis.to;
                        });
                        plot.setupGrid();
                        plot.draw();
                        plot.clearSelection();

                        overview.setSelection(ranges, true);
                    });

                    $("#sensor-values-time-overview").bind("plotselected", function(event, ranges) {
                        plot.setSelection(ranges);
                    });

                    $("<div id='tooltip'></div>").css({
                        position: "absolute",
                        display: "none",
                        border: "1px solid #fdd",
                        padding: "2px",
                        "background-color": "#fee",
                        opacity: 0.80
                    }).appendTo("body");

                    $("#mq2-graph").bind("plothover", function(event, pos, item) {

                        if (true) {
                            if (item) {
                                var x = item.datapoint[0],
                                    y = item.datapoint[1].toFixed(2);

                                $("#tooltip").html(item.series.label + " on " + (new Date(x).getMonth() + 1) + "/" + (new Date(x)).getDate() + "/" + (new Date(x)).getUTCFullYear() + " was " + y)
                                    .css({ top: item.pageY + 5, left: item.pageX + 5 })
                                    .fadeIn(200);
                            } else {
                                $("#tooltip").hide();
                            }
                        }
                    });

                    $("#mq2-graph").bind("plotclick", function(event, pos, item) {
                        if (item) {
                            $("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
                            plot.highlight(item.series, item.datapoint);
                        }
                    });
                }
                plotAccordingToChoices();

            }

            //graph mq3 independant
            if (!!document.getElementById('mq3-graph')) {

                var datasets = new Object();

                var pm25Data = new Array();
                var pm10Data = new Array();
                var mq2Data = new Array();
                var mq3Data = new Array();
                var mq4Data = new Array();
                var mq5Data = new Array();
                var mq6Data = new Array();
                var mq7Data = new Array();

                //newData = JSON.parse(newData);

                for (var i in newData) {

                    var date = parseInt(newData[i]['_id'].toString().substr(0, 8), 16) * 1000;
                    date = new Date(date);
                    var time = new Date(date).getTime();

                    var pm25 = Math.round(parseFloat(newData[i]['data']['pm25']) * 11.50 * 100) / 100;
                    var pm10 = Math.round(parseFloat(newData[i]['data']['pm10']) * 2.41 * 100) / 100;
                    var mq2 = newData[i]['data']['mq2'];
                    var mq3 = newData[i]['data']['mq3'];
                    var mq4 = newData[i]['data']['mq4'];
                    var mq5 = newData[i]['data']['mq5'];
                    var mq6 = newData[i]['data']['mq6'];
                    var mq7 = newData[i]['data']['mq7'];
                    var temp = newData[i]['data']['temperature'];
                    var hum = newData[i]['data']['humidity'];

                    pm25Data.push([time, pm25]);
                    pm10Data.push([time, pm10]);
                    mq2Data.push([time, mq2]);
                    mq3Data.push([time, mq3]);
                    mq4Data.push([time, mq4]);
                    mq5Data.push([time, mq5]);
                    mq6Data.push([time, mq6]);
                    mq7Data.push([time, mq7]);

                    //console.log(time + " " + pm25);
                }

                var pm25Obj = { 'data': pm25Data, 'label': "Particles (PM2.5)", color: 1 };
                var pm10Obj = { 'data': pm10Data, 'label': "Particles (PM10)", color: 2 };
                var mq2Obj = { 'data': mq2Data, 'label': "Propane", color: 3 };
                var mq3Obj = { 'data': mq3Data, 'label': "Benzine", color: 4 };
                var mq4Obj = { 'data': mq4Data, 'label': "Methane", color: 5 };
                var mq5Obj = { 'data': mq5Data, 'label': "Hydrogen", color: 6 };
                var mq6Obj = { 'data': mq6Data, 'label': "Butane", color: 7 };
                var mq7Obj = { 'data': mq7Data, 'label': "Carbon Monoxide", color: 8 };

                datasets.pm25 = pm25Obj;
                datasets.pm10 = pm10Obj;
                datasets.mq2 = mq2Obj;
                datasets.mq3 = mq3Obj;
                datasets.mq4 = mq4Obj;
                datasets.mq5 = mq5Obj;
                datasets.mq6 = mq6Obj;
                datasets.mq7 = mq7Obj;

                console.log('Datasets: ');
                console.log(datasets);

                //end of formatting
                //graph stuff:

                var i = 0;
                $.each(datasets, function(key, val) {
                    val.color = i;
                    ++i;
                });

                var choiceContainer = $("#choices");
                $.each(datasets, function(key, val) {
                    if (key == 'mq3') { //dont forget to change here
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' checked='checked' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    } else {
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    }
                });

                choiceContainer.find("input").click(plotAccordingToChoices);

                function plotAccordingToChoices() {

                    var data = [];

                    choiceContainer.find("input:checked").each(function() {
                        var key = $(this).attr("name");
                        if (key && datasets[key]) {
                            data.push(datasets[key]);
                        }
                    });
                    var plot = $.plot("#mq3-graph", data, {
                        grid: {
                            hoverable: true,
                            clickable: true
                        },
                        series: {
                            lines: {
                                show: true
                            },
                            points: {
                                show: true
                            }
                        },
                        yaxis: {
                            min: 0
                        },
                        xaxis: {
                            mode: "time",
                            timeformat: "%m/%d/%y",
                            tickSize: [24, "hour"],
                            tickFormatter: function(val, axis) {
                                var date = (new Date((val)).getMonth() + 1) + "/" + (new Date(val)).getDate() + "/" + (new Date(val)).getUTCFullYear();
                                return date;
                            }
                        }
                    });


                    if (data.length > 0) {
                        var overview = $.plot("#sensor-values-time-overview", data, {
                            series: {
                                lines: {
                                    show: true,
                                    lineWidth: 1
                                },
                                shadowSize: 0
                            },
                            xaxis: {
                                ticks: [],
                                mode: "time"
                            },
                            yaxis: {
                                ticks: [],
                                min: 0,
                                autoscaleMargin: 0.1
                            },
                            selection: {
                                mode: "x"
                            },
                            legend: {
                                show: false
                            }
                        });
                    }

                    $("#mq3-graph").bind("plotselected", function(event, ranges) {

                        $.each(plot.getXAxes(), function(_, axis) {
                            var opts = axis.options;
                            opts.min = ranges.xaxis.from;
                            opts.max = ranges.xaxis.to;
                        });
                        plot.setupGrid();
                        plot.draw();
                        plot.clearSelection();

                        overview.setSelection(ranges, true);
                    });

                    $("#sensor-values-time-overview").bind("plotselected", function(event, ranges) {
                        plot.setSelection(ranges);
                    });

                    $("<div id='tooltip'></div>").css({
                        position: "absolute",
                        display: "none",
                        border: "1px solid #fdd",
                        padding: "2px",
                        "background-color": "#fee",
                        opacity: 0.80
                    }).appendTo("body");

                    $("#mq3-graph").bind("plothover", function(event, pos, item) {

                        if (true) {
                            if (item) {
                                var x = item.datapoint[0],
                                    y = item.datapoint[1].toFixed(2);

                                $("#tooltip").html(item.series.label + " on " + (new Date(x).getMonth() + 1) + "/" + (new Date(x)).getDate() + "/" + (new Date(x)).getUTCFullYear() + " was " + y)
                                    .css({ top: item.pageY + 5, left: item.pageX + 5 })
                                    .fadeIn(200);
                            } else {
                                $("#tooltip").hide();
                            }
                        }
                    });

                    $("#mq3-graph").bind("plotclick", function(event, pos, item) {
                        if (item) {
                            $("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
                            plot.highlight(item.series, item.datapoint);
                        }
                    });
                }
                plotAccordingToChoices();
            }

            //graph mq4 independant
            if (!!document.getElementById('mq4-graph')) {

                var datasets = new Object();

                var pm25Data = new Array();
                var pm10Data = new Array();
                var mq2Data = new Array();
                var mq3Data = new Array();
                var mq4Data = new Array();
                var mq5Data = new Array();
                var mq6Data = new Array();
                var mq7Data = new Array();

                //newData = JSON.parse(newData);

                for (var i in newData) {

                    var date = parseInt(newData[i]['_id'].toString().substr(0, 8), 16) * 1000;
                    date = new Date(date);
                    var time = new Date(date).getTime();

                    var pm25 = Math.round(parseFloat(newData[i]['data']['pm25']) * 11.50 * 100) / 100;
                    var pm10 = Math.round(parseFloat(newData[i]['data']['pm10']) * 2.41 * 100) / 100;
                    var mq2 = newData[i]['data']['mq2'];
                    var mq3 = newData[i]['data']['mq3'];
                    var mq4 = newData[i]['data']['mq4'];
                    var mq5 = newData[i]['data']['mq5'];
                    var mq6 = newData[i]['data']['mq6'];
                    var mq7 = newData[i]['data']['mq7'];
                    var temp = newData[i]['data']['temperature'];
                    var hum = newData[i]['data']['humidity'];

                    pm25Data.push([time, pm25]);
                    pm10Data.push([time, pm10]);
                    mq2Data.push([time, mq2]);
                    mq3Data.push([time, mq3]);
                    mq4Data.push([time, mq4]);
                    mq5Data.push([time, mq5]);
                    mq6Data.push([time, mq6]);
                    mq7Data.push([time, mq7]);

                    //console.log(time + " " + pm25);
                }

                var pm25Obj = { 'data': pm25Data, 'label': "Particles (PM2.5)", color: 1 };
                var pm10Obj = { 'data': pm10Data, 'label': "Particles (PM10)", color: 2 };
                var mq2Obj = { 'data': mq2Data, 'label': "Propane", color: 3 };
                var mq3Obj = { 'data': mq3Data, 'label': "Benzine", color: 4 };
                var mq4Obj = { 'data': mq4Data, 'label': "Methane", color: 5 };
                var mq5Obj = { 'data': mq5Data, 'label': "Hydrogen", color: 6 };
                var mq6Obj = { 'data': mq6Data, 'label': "Butane", color: 7 };
                var mq7Obj = { 'data': mq7Data, 'label': "Carbon Monoxide", color: 8 };

                datasets.pm25 = pm25Obj;
                datasets.pm10 = pm10Obj;
                datasets.mq2 = mq2Obj;
                datasets.mq3 = mq3Obj;
                datasets.mq4 = mq4Obj;
                datasets.mq5 = mq5Obj;
                datasets.mq6 = mq6Obj;
                datasets.mq7 = mq7Obj;

                console.log('Datasets: ');
                console.log(datasets);

                //end of formatting
                //graph stuff:

                var i = 0;
                $.each(datasets, function(key, val) {
                    val.color = i;
                    ++i;
                });

                var choiceContainer = $("#choices");
                $.each(datasets, function(key, val) {
                    if (key == 'mq4') { //dont forget to change here
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' checked='checked' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    } else {
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    }
                });

                choiceContainer.find("input").click(plotAccordingToChoices);

                function plotAccordingToChoices() {

                    var data = [];

                    choiceContainer.find("input:checked").each(function() {
                        var key = $(this).attr("name");
                        if (key && datasets[key]) {
                            data.push(datasets[key]);
                        }
                    });
                    var plot = $.plot("#mq4-graph", data, {
                        grid: {
                            hoverable: true,
                            clickable: true
                        },
                        series: {
                            lines: {
                                show: true
                            },
                            points: {
                                show: true
                            }
                        },
                        yaxis: {
                            min: 0
                        },
                        xaxis: {
                            mode: "time",
                            timeformat: "%m/%d/%y",
                            tickSize: [24, "hour"],
                            tickFormatter: function(val, axis) {
                                var date = (new Date((val)).getMonth() + 1) + "/" + (new Date(val)).getDate() + "/" + (new Date(val)).getUTCFullYear();
                                return date;
                            }
                        }
                    });


                    if (data.length > 0) {
                        var overview = $.plot("#sensor-values-time-overview", data, {
                            series: {
                                lines: {
                                    show: true,
                                    lineWidth: 1
                                },
                                shadowSize: 0
                            },
                            xaxis: {
                                ticks: [],
                                mode: "time"
                            },
                            yaxis: {
                                ticks: [],
                                min: 0,
                                autoscaleMargin: 0.1
                            },
                            selection: {
                                mode: "x"
                            },
                            legend: {
                                show: false
                            }
                        });
                    }

                    $("#mq4-graph").bind("plotselected", function(event, ranges) {

                        $.each(plot.getXAxes(), function(_, axis) {
                            var opts = axis.options;
                            opts.min = ranges.xaxis.from;
                            opts.max = ranges.xaxis.to;
                        });
                        plot.setupGrid();
                        plot.draw();
                        plot.clearSelection();

                        overview.setSelection(ranges, true);
                    });

                    $("#sensor-values-time-overview").bind("plotselected", function(event, ranges) {
                        plot.setSelection(ranges);
                    });

                    $("<div id='tooltip'></div>").css({
                        position: "absolute",
                        display: "none",
                        border: "1px solid #fdd",
                        padding: "2px",
                        "background-color": "#fee",
                        opacity: 0.80
                    }).appendTo("body");

                    $("#mq4-graph").bind("plothover", function(event, pos, item) {

                        if (true) {
                            if (item) {
                                var x = item.datapoint[0],
                                    y = item.datapoint[1].toFixed(2);

                                $("#tooltip").html(item.series.label + " on " + (new Date(x).getMonth() + 1) + "/" + (new Date(x)).getDate() + "/" + (new Date(x)).getUTCFullYear() + " was " + y)
                                    .css({ top: item.pageY + 5, left: item.pageX + 5 })
                                    .fadeIn(200);
                            } else {
                                $("#tooltip").hide();
                            }
                        }
                    });

                    $("#mq4-graph").bind("plotclick", function(event, pos, item) {
                        if (item) {
                            $("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
                            plot.highlight(item.series, item.datapoint);
                        }
                    });
                }
                plotAccordingToChoices();
            }

            //graph mq5 independant
            if (!!document.getElementById('mq5-graph')) {

                var datasets = new Object();

                var pm25Data = new Array();
                var pm10Data = new Array();
                var mq2Data = new Array();
                var mq3Data = new Array();
                var mq4Data = new Array();
                var mq5Data = new Array();
                var mq6Data = new Array();
                var mq7Data = new Array();

                //newData = JSON.parse(newData);

                for (var i in newData) {

                    var date = parseInt(newData[i]['_id'].toString().substr(0, 8), 16) * 1000;
                    date = new Date(date);
                    var time = new Date(date).getTime();

                    var pm25 = Math.round(parseFloat(newData[i]['data']['pm25']) * 11.50 * 100) / 100;
                    var pm10 = Math.round(parseFloat(newData[i]['data']['pm10']) * 2.41 * 100) / 100;
                    var mq2 = newData[i]['data']['mq2'];
                    var mq3 = newData[i]['data']['mq3'];
                    var mq4 = newData[i]['data']['mq4'];
                    var mq5 = newData[i]['data']['mq5'];
                    var mq6 = newData[i]['data']['mq6'];
                    var mq7 = newData[i]['data']['mq7'];
                    var temp = newData[i]['data']['temperature'];
                    var hum = newData[i]['data']['humidity'];

                    pm25Data.push([time, pm25]);
                    pm10Data.push([time, pm10]);
                    mq2Data.push([time, mq2]);
                    mq3Data.push([time, mq3]);
                    mq4Data.push([time, mq4]);
                    mq5Data.push([time, mq5]);
                    mq6Data.push([time, mq6]);
                    mq7Data.push([time, mq7]);

                    //console.log(time + " " + pm25);
                }

                var pm25Obj = { 'data': pm25Data, 'label': "Particles (PM2.5)", color: 1 };
                var pm10Obj = { 'data': pm10Data, 'label': "Particles (PM10)", color: 2 };
                var mq2Obj = { 'data': mq2Data, 'label': "Propane", color: 3 };
                var mq3Obj = { 'data': mq3Data, 'label': "Benzine", color: 4 };
                var mq4Obj = { 'data': mq4Data, 'label': "Methane", color: 5 };
                var mq5Obj = { 'data': mq5Data, 'label': "Hydrogen", color: 6 };
                var mq6Obj = { 'data': mq6Data, 'label': "Butane", color: 7 };
                var mq7Obj = { 'data': mq7Data, 'label': "Carbon Monoxide", color: 8 };

                datasets.pm25 = pm25Obj;
                datasets.pm10 = pm10Obj;
                datasets.mq2 = mq2Obj;
                datasets.mq3 = mq3Obj;
                datasets.mq4 = mq4Obj;
                datasets.mq5 = mq5Obj;
                datasets.mq6 = mq6Obj;
                datasets.mq7 = mq7Obj;

                console.log('Datasets: ');
                console.log(datasets);

                //end of formatting
                //graph stuff:

                var i = 0;
                $.each(datasets, function(key, val) {
                    val.color = i;
                    ++i;
                });

                var choiceContainer = $("#choices");
                $.each(datasets, function(key, val) {
                    if (key == 'mq5') { //dont forget to change here
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' checked='checked' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    } else {
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    }
                });

                choiceContainer.find("input").click(plotAccordingToChoices);

                function plotAccordingToChoices() {

                    var data = [];

                    choiceContainer.find("input:checked").each(function() {
                        var key = $(this).attr("name");
                        if (key && datasets[key]) {
                            data.push(datasets[key]);
                        }
                    });
                    var plot = $.plot("#mq5-graph", data, {
                        grid: {
                            hoverable: true,
                            clickable: true
                        },
                        series: {
                            lines: {
                                show: true
                            },
                            points: {
                                show: true
                            }
                        },
                        yaxis: {
                            min: 0
                        },
                        xaxis: {
                            mode: "time",
                            timeformat: "%m/%d/%y",
                            tickSize: [24, "hour"],
                            tickFormatter: function(val, axis) {
                                var date = (new Date((val)).getMonth() + 1) + "/" + (new Date(val)).getDate() + "/" + (new Date(val)).getUTCFullYear();
                                return date;
                            }
                        }
                    });


                    if (data.length > 0) {
                        var overview = $.plot("#sensor-values-time-overview", data, {
                            series: {
                                lines: {
                                    show: true,
                                    lineWidth: 1
                                },
                                shadowSize: 0
                            },
                            xaxis: {
                                ticks: [],
                                mode: "time"
                            },
                            yaxis: {
                                ticks: [],
                                min: 0,
                                autoscaleMargin: 0.1
                            },
                            selection: {
                                mode: "x"
                            },
                            legend: {
                                show: false
                            }
                        });
                    }

                    $("#mq5-graph").bind("plotselected", function(event, ranges) {

                        $.each(plot.getXAxes(), function(_, axis) {
                            var opts = axis.options;
                            opts.min = ranges.xaxis.from;
                            opts.max = ranges.xaxis.to;
                        });
                        plot.setupGrid();
                        plot.draw();
                        plot.clearSelection();

                        overview.setSelection(ranges, true);
                    });

                    $("#sensor-values-time-overview").bind("plotselected", function(event, ranges) {
                        plot.setSelection(ranges);
                    });

                    $("<div id='tooltip'></div>").css({
                        position: "absolute",
                        display: "none",
                        border: "1px solid #fdd",
                        padding: "2px",
                        "background-color": "#fee",
                        opacity: 0.80
                    }).appendTo("body");

                    $("#mq5-graph").bind("plothover", function(event, pos, item) {

                        if (true) {
                            if (item) {
                                var x = item.datapoint[0],
                                    y = item.datapoint[1].toFixed(2);

                                $("#tooltip").html(item.series.label + " on " + (new Date(x).getMonth() + 1) + "/" + (new Date(x)).getDate() + "/" + (new Date(x)).getUTCFullYear() + " was " + y)
                                    .css({ top: item.pageY + 5, left: item.pageX + 5 })
                                    .fadeIn(200);
                            } else {
                                $("#tooltip").hide();
                            }
                        }
                    });

                    $("#mq5-graph").bind("plotclick", function(event, pos, item) {
                        if (item) {
                            $("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
                            plot.highlight(item.series, item.datapoint);
                        }
                    });
                }
                plotAccordingToChoices();
            }

            //graph mq6 independant
            if (!!document.getElementById('mq6-graph')) {

                var datasets = new Object();

                var pm25Data = new Array();
                var pm10Data = new Array();
                var mq2Data = new Array();
                var mq3Data = new Array();
                var mq4Data = new Array();
                var mq5Data = new Array();
                var mq6Data = new Array();
                var mq7Data = new Array();

                //newData = JSON.parse(newData);

                for (var i in newData) {

                    var date = parseInt(newData[i]['_id'].toString().substr(0, 8), 16) * 1000;
                    date = new Date(date);
                    var time = new Date(date).getTime();

                    var pm25 = Math.round(parseFloat(newData[i]['data']['pm25']) * 11.50 * 100) / 100;
                    var pm10 = Math.round(parseFloat(newData[i]['data']['pm10']) * 2.41 * 100) / 100;
                    var mq2 = newData[i]['data']['mq2'];
                    var mq3 = newData[i]['data']['mq3'];
                    var mq4 = newData[i]['data']['mq4'];
                    var mq5 = newData[i]['data']['mq5'];
                    var mq6 = newData[i]['data']['mq6'];
                    var mq7 = newData[i]['data']['mq7'];
                    var temp = newData[i]['data']['temperature'];
                    var hum = newData[i]['data']['humidity'];

                    pm25Data.push([time, pm25]);
                    pm10Data.push([time, pm10]);
                    mq2Data.push([time, mq2]);
                    mq3Data.push([time, mq3]);
                    mq4Data.push([time, mq4]);
                    mq5Data.push([time, mq5]);
                    mq6Data.push([time, mq6]);
                    mq7Data.push([time, mq7]);

                    //console.log(time + " " + pm25);
                }

                var pm25Obj = { 'data': pm25Data, 'label': "Particles (PM2.5)", color: 1 };
                var pm10Obj = { 'data': pm10Data, 'label': "Particles (PM10)", color: 2 };
                var mq2Obj = { 'data': mq2Data, 'label': "Propane", color: 3 };
                var mq3Obj = { 'data': mq3Data, 'label': "Benzine", color: 4 };
                var mq4Obj = { 'data': mq4Data, 'label': "Methane", color: 5 };
                var mq5Obj = { 'data': mq5Data, 'label': "Hydrogen", color: 6 };
                var mq6Obj = { 'data': mq6Data, 'label': "Butane", color: 7 };
                var mq7Obj = { 'data': mq7Data, 'label': "Carbon Monoxide", color: 8 };

                datasets.pm25 = pm25Obj;
                datasets.pm10 = pm10Obj;
                datasets.mq2 = mq2Obj;
                datasets.mq3 = mq3Obj;
                datasets.mq4 = mq4Obj;
                datasets.mq5 = mq5Obj;
                datasets.mq6 = mq6Obj;
                datasets.mq7 = mq7Obj;

                console.log('Datasets: ');
                console.log(datasets);

                //end of formatting
                //graph stuff:

                var i = 0;
                $.each(datasets, function(key, val) {
                    val.color = i;
                    ++i;
                });

                var choiceContainer = $("#choices");
                $.each(datasets, function(key, val) {
                    if (key == 'mq6') { //dont forget to change here
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' checked='checked' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    } else {
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    }
                });

                choiceContainer.find("input").click(plotAccordingToChoices);

                function plotAccordingToChoices() {

                    var data = [];

                    choiceContainer.find("input:checked").each(function() {
                        var key = $(this).attr("name");
                        if (key && datasets[key]) {
                            data.push(datasets[key]);
                        }
                    });
                    var plot = $.plot("#mq6-graph", data, {
                        grid: {
                            hoverable: true,
                            clickable: true
                        },
                        series: {
                            lines: {
                                show: true
                            },
                            points: {
                                show: true
                            }
                        },
                        yaxis: {
                            min: 0
                        },
                        xaxis: {
                            mode: "time",
                            timeformat: "%m/%d/%y",
                            tickSize: [24, "hour"],
                            tickFormatter: function(val, axis) {
                                var date = (new Date((val)).getMonth() + 1) + "/" + (new Date(val)).getDate() + "/" + (new Date(val)).getUTCFullYear();
                                return date;
                            }
                        }
                    });


                    if (data.length > 0) {
                        var overview = $.plot("#sensor-values-time-overview", data, {
                            series: {
                                lines: {
                                    show: true,
                                    lineWidth: 1
                                },
                                shadowSize: 0
                            },
                            xaxis: {
                                ticks: [],
                                mode: "time"
                            },
                            yaxis: {
                                ticks: [],
                                min: 0,
                                autoscaleMargin: 0.1
                            },
                            selection: {
                                mode: "x"
                            },
                            legend: {
                                show: false
                            }
                        });
                    }

                    $("#mq6-graph").bind("plotselected", function(event, ranges) {

                        $.each(plot.getXAxes(), function(_, axis) {
                            var opts = axis.options;
                            opts.min = ranges.xaxis.from;
                            opts.max = ranges.xaxis.to;
                        });
                        plot.setupGrid();
                        plot.draw();
                        plot.clearSelection();

                        overview.setSelection(ranges, true);
                    });

                    $("#sensor-values-time-overview").bind("plotselected", function(event, ranges) {
                        plot.setSelection(ranges);
                    });

                    $("<div id='tooltip'></div>").css({
                        position: "absolute",
                        display: "none",
                        border: "1px solid #fdd",
                        padding: "2px",
                        "background-color": "#fee",
                        opacity: 0.80
                    }).appendTo("body");

                    $("#mq6-graph").bind("plothover", function(event, pos, item) {

                        if (true) {
                            if (item) {
                                var x = item.datapoint[0],
                                    y = item.datapoint[1].toFixed(2);

                                $("#tooltip").html(item.series.label + " on " + (new Date(x).getMonth() + 1) + "/" + (new Date(x)).getDate() + "/" + (new Date(x)).getUTCFullYear() + " was " + y)
                                    .css({ top: item.pageY + 5, left: item.pageX + 5 })
                                    .fadeIn(200);
                            } else {
                                $("#tooltip").hide();
                            }
                        }
                    });

                    $("#mq6-graph").bind("plotclick", function(event, pos, item) {
                        if (item) {
                            $("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
                            plot.highlight(item.series, item.datapoint);
                        }
                    });
                }
                plotAccordingToChoices();
            }

            //graph mq7 independant
            if (!!document.getElementById('mq7-graph')) {

                var datasets = new Object();

                var pm25Data = new Array();
                var pm10Data = new Array();
                var mq2Data = new Array();
                var mq3Data = new Array();
                var mq4Data = new Array();
                var mq5Data = new Array();
                var mq6Data = new Array();
                var mq7Data = new Array();

                //newData = JSON.parse(newData);

                for (var i in newData) {

                    var date = parseInt(newData[i]['_id'].toString().substr(0, 8), 16) * 1000;
                    date = new Date(date);
                    var time = new Date(date).getTime();

                    var pm25 = Math.round(parseFloat(newData[i]['data']['pm25']) * 11.50 * 100) / 100;
                    var pm10 = Math.round(parseFloat(newData[i]['data']['pm10']) * 2.41 * 100) / 100;
                    var mq2 = newData[i]['data']['mq2'];
                    var mq3 = newData[i]['data']['mq3'];
                    var mq4 = newData[i]['data']['mq4'];
                    var mq5 = newData[i]['data']['mq5'];
                    var mq6 = newData[i]['data']['mq6'];
                    var mq7 = newData[i]['data']['mq7'];
                    var temp = newData[i]['data']['temperature'];
                    var hum = newData[i]['data']['humidity'];

                    pm25Data.push([time, pm25]);
                    pm10Data.push([time, pm10]);
                    mq2Data.push([time, mq2]);
                    mq3Data.push([time, mq3]);
                    mq4Data.push([time, mq4]);
                    mq5Data.push([time, mq5]);
                    mq6Data.push([time, mq6]);
                    mq7Data.push([time, mq7]);

                    //console.log(time + " " + pm25);
                }

                var pm25Obj = { 'data': pm25Data, 'label': "Particles (PM2.5)", color: 1 };
                var pm10Obj = { 'data': pm10Data, 'label': "Particles (PM10)", color: 2 };
                var mq2Obj = { 'data': mq2Data, 'label': "Propane", color: 3 };
                var mq3Obj = { 'data': mq3Data, 'label': "Benzine", color: 4 };
                var mq4Obj = { 'data': mq4Data, 'label': "Methane", color: 5 };
                var mq5Obj = { 'data': mq5Data, 'label': "Hydrogen", color: 6 };
                var mq6Obj = { 'data': mq6Data, 'label': "Butane", color: 7 };
                var mq7Obj = { 'data': mq7Data, 'label': "Carbon Monoxide", color: 8 };

                datasets.pm25 = pm25Obj;
                datasets.pm10 = pm10Obj;
                datasets.mq2 = mq2Obj;
                datasets.mq3 = mq3Obj;
                datasets.mq4 = mq4Obj;
                datasets.mq5 = mq5Obj;
                datasets.mq6 = mq6Obj;
                datasets.mq7 = mq7Obj;

                console.log('Datasets: ');
                console.log(datasets);

                //end of formatting
                //graph stuff:

                var i = 0;
                $.each(datasets, function(key, val) {
                    val.color = i;
                    ++i;
                });

                var choiceContainer = $("#choices");
                $.each(datasets, function(key, val) {
                    if (key == 'mq7') { //dont forget to change here
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' checked='checked' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    } else {
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    }
                });

                choiceContainer.find("input").click(plotAccordingToChoices);

                function plotAccordingToChoices() {

                    var data = [];

                    choiceContainer.find("input:checked").each(function() {
                        var key = $(this).attr("name");
                        if (key && datasets[key]) {
                            data.push(datasets[key]);
                        }
                    });
                    var plot = $.plot("#mq7-graph", data, {
                        grid: {
                            hoverable: true,
                            clickable: true
                        },
                        series: {
                            lines: {
                                show: true
                            },
                            points: {
                                show: true
                            }
                        },
                        yaxis: {
                            min: 0
                        },
                        xaxis: {
                            mode: "time",
                            timeformat: "%m/%d/%y",
                            tickSize: [24, "hour"],
                            tickFormatter: function(val, axis) {
                                var date = (new Date((val)).getMonth() + 1) + "/" + (new Date(val)).getDate() + "/" + (new Date(val)).getUTCFullYear();
                                return date;
                            }
                        }
                    });


                    if (data.length > 0) {
                        var overview = $.plot("#sensor-values-time-overview", data, {
                            series: {
                                lines: {
                                    show: true,
                                    lineWidth: 1
                                },
                                shadowSize: 0
                            },
                            xaxis: {
                                ticks: [],
                                mode: "time"
                            },
                            yaxis: {
                                ticks: [],
                                min: 0,
                                autoscaleMargin: 0.1
                            },
                            selection: {
                                mode: "x"
                            },
                            legend: {
                                show: false
                            }
                        });
                    }

                    $("#mq7-graph").bind("plotselected", function(event, ranges) {

                        $.each(plot.getXAxes(), function(_, axis) {
                            var opts = axis.options;
                            opts.min = ranges.xaxis.from;
                            opts.max = ranges.xaxis.to;
                        });
                        plot.setupGrid();
                        plot.draw();
                        plot.clearSelection();

                        overview.setSelection(ranges, true);
                    });

                    $("#sensor-values-time-overview").bind("plotselected", function(event, ranges) {
                        plot.setSelection(ranges);
                    });

                    $("<div id='tooltip'></div>").css({
                        position: "absolute",
                        display: "none",
                        border: "1px solid #fdd",
                        padding: "2px",
                        "background-color": "#fee",
                        opacity: 0.80
                    }).appendTo("body");

                    $("#mq7-graph").bind("plothover", function(event, pos, item) {

                        if (true) {
                            if (item) {
                                var x = item.datapoint[0],
                                    y = item.datapoint[1].toFixed(2);

                                $("#tooltip").html(item.series.label + " on " + (new Date(x).getMonth() + 1) + "/" + (new Date(x)).getDate() + "/" + (new Date(x)).getUTCFullYear() + " was " + y)
                                    .css({ top: item.pageY + 5, left: item.pageX + 5 })
                                    .fadeIn(200);
                            } else {
                                $("#tooltip").hide();
                            }
                        }
                    });

                    $("#mq7-graph").bind("plotclick", function(event, pos, item) {
                        if (item) {
                            $("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
                            plot.highlight(item.series, item.datapoint);
                        }
                    });
                }
                plotAccordingToChoices();
            }

            //graph all together
            if (!!document.getElementById('all-graph')) {

                var datasets = new Object();

                var pm25Data = new Array();
                var pm10Data = new Array();
                var mq2Data = new Array();
                var mq3Data = new Array();
                var mq4Data = new Array();
                var mq5Data = new Array();
                var mq6Data = new Array();
                var mq7Data = new Array();

                //newData = JSON.parse(newData);

                for (var i in newData) {

                    var date = parseInt(newData[i]['_id'].toString().substr(0, 8), 16) * 1000;
                    date = new Date(date);
                    var time = new Date(date).getTime();

                    var pm25 = Math.round(parseFloat(newData[i]['data']['pm25']) * 11.50 * 100) / 100;
                    var pm10 = Math.round(parseFloat(newData[i]['data']['pm10']) * 2.41 * 100) / 100;
                    var mq2 = newData[i]['data']['mq2'];
                    var mq3 = newData[i]['data']['mq3'];
                    var mq4 = newData[i]['data']['mq4'];
                    var mq5 = newData[i]['data']['mq5'];
                    var mq6 = newData[i]['data']['mq6'];
                    var mq7 = newData[i]['data']['mq7'];
                    var temp = newData[i]['data']['temperature'];
                    var hum = newData[i]['data']['humidity'];

                    pm25Data.push([time, pm25]);
                    pm10Data.push([time, pm10]);
                    mq2Data.push([time, mq2]);
                    mq3Data.push([time, mq3]);
                    mq4Data.push([time, mq4]);
                    mq5Data.push([time, mq5]);
                    mq6Data.push([time, mq6]);
                    mq7Data.push([time, mq7]);

                    //console.log(time + " " + pm25);
                }

                var pm25Obj = { 'data': pm25Data, 'label': "Particles (PM2.5)", color: 1 };
                var pm10Obj = { 'data': pm10Data, 'label': "Particles (PM10)", color: 2 };
                var mq2Obj = { 'data': mq2Data, 'label': "Propane", color: 3 };
                var mq3Obj = { 'data': mq3Data, 'label': "Benzine", color: 4 };
                var mq4Obj = { 'data': mq4Data, 'label': "Methane", color: 5 };
                var mq5Obj = { 'data': mq5Data, 'label': "Hydrogen", color: 6 };
                var mq6Obj = { 'data': mq6Data, 'label': "Butane", color: 7 };
                var mq7Obj = { 'data': mq7Data, 'label': "Carbon Monoxide", color: 8 };

                datasets.pm25 = pm25Obj;
                datasets.pm10 = pm10Obj;
                datasets.mq2 = mq2Obj;
                datasets.mq3 = mq3Obj;
                datasets.mq4 = mq4Obj;
                datasets.mq5 = mq5Obj;
                datasets.mq6 = mq6Obj;
                datasets.mq7 = mq7Obj;

                console.log('Datasets: ');
                console.log(datasets);

                //end of formatting
                //graph stuff:

                var i = 0;
                $.each(datasets, function(key, val) {
                    val.color = i;
                    ++i;
                });

                var choiceContainer = $("#choices");
                $.each(datasets, function(key, val) {
                    if (key == 'all') { //dont forget to change here
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' checked='checked' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    } else {
                        choiceContainer.append("<input type='checkbox' name='" + key +
                            "' checked='checked' id='id" + key + "'></input>" +
                            "<label for='id" + key + "' style='margin: 10px;'>" +
                            val.label + "</label>");
                    }
                });

                choiceContainer.find("input").click(plotAccordingToChoices);

                function plotAccordingToChoices() {

                    var data = [];

                    choiceContainer.find("input:checked").each(function() {
                        var key = $(this).attr("name");
                        if (key && datasets[key]) {
                            data.push(datasets[key]);
                        }
                    });
                    var plot = $.plot("#all-graph", data, {
                        grid: {
                            hoverable: true,
                            clickable: true
                        },
                        series: {
                            lines: {
                                show: true
                            },
                            points: {
                                show: true
                            }
                        },
                        yaxis: {
                            min: 0
                        },
                        xaxis: {
                            mode: "time",
                            timeformat: "%m/%d/%y",
                            tickSize: [24, "hour"],
                            tickFormatter: function(val, axis) {
                                var date = (new Date((val)).getMonth() + 1) + "/" + (new Date(val)).getDate() + "/" + (new Date(val)).getUTCFullYear();
                                return date;
                            }
                        }
                    });


                    if (data.length > 0) {
                        var overview = $.plot("#sensor-values-time-overview", data, {
                            series: {
                                lines: {
                                    show: true,
                                    lineWidth: 1
                                },
                                shadowSize: 0
                            },
                            xaxis: {
                                ticks: [],
                                mode: "time"
                            },
                            yaxis: {
                                ticks: [],
                                min: 0,
                                autoscaleMargin: 0.1
                            },
                            selection: {
                                mode: "x"
                            },
                            legend: {
                                show: false
                            }
                        });
                    }

                    $("#all-graph").bind("plotselected", function(event, ranges) {

                        $.each(plot.getXAxes(), function(_, axis) {
                            var opts = axis.options;
                            opts.min = ranges.xaxis.from;
                            opts.max = ranges.xaxis.to;
                        });
                        plot.setupGrid();
                        plot.draw();
                        plot.clearSelection();

                        overview.setSelection(ranges, true);
                    });

                    $("#sensor-values-time-overview").bind("plotselected", function(event, ranges) {
                        plot.setSelection(ranges);
                    });

                    $("<div id='tooltip'></div>").css({
                        position: "absolute",
                        display: "none",
                        border: "1px solid #fdd",
                        padding: "2px",
                        "background-color": "#fee",
                        opacity: 0.80
                    }).appendTo("body");

                    $("#all-graph").bind("plothover", function(event, pos, item) {

                        if (true) {
                            if (item) {
                                var x = item.datapoint[0],
                                    y = item.datapoint[1].toFixed(2);

                                $("#tooltip").html(item.series.label + " on " + (new Date(x).getMonth() + 1) + "/" + (new Date(x)).getDate() + "/" + (new Date(x)).getUTCFullYear() + " was " + y)
                                    .css({ top: item.pageY + 5, left: item.pageX + 5 })
                                    .fadeIn(200);
                            } else {
                                $("#tooltip").hide();
                            }
                        }
                    });

                    $("#all-graph").bind("plotclick", function(event, pos, item) {
                        if (item) {
                            $("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
                            plot.highlight(item.series, item.datapoint);
                        }
                    });
                }
                plotAccordingToChoices();
            }



            //VISUALIZATION AND MAPPING HERE

            const DATA_URL = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv';

            class Root extends Component {
                constructor(props) {
                    super(props);
                    this.state = {
                        viewport: {
                            ...DeckGLOverlay.defaultViewport,
                            width: 500,
                            height: 500
                        },
                        data: null
                    };

                    requestCsv(DATA_URL, (error, responsedata) => {
                        if (!error) {

                            var response = new Array();
                            for (var i in newData) {

                                var lng = newData[i]['pos']['lon'];
                                var lat = newData[i]['pos']['lat'];

                                var positionArray = new Array();

                                positionArray.push(lng);
                                positionArray.push(lat);

                                response.push(positionArray);

                            }

                            console.log(data);
                            this.setState({ data: response });

                        }
                    });
                    this._onHover = this._onHover.bind(this);
                }

                componentDidMount() {
                    window.addEventListener('resize', this._resize.bind(this));
                    this._resize();
                }

                _resize() {
                    this._onViewportChange({
                        width: window.innerWidth,
                        height: window.innerHeight
                    });
                }

                _onViewportChange(viewport) {
                    this.setState({
                        viewport: {...this.state.viewport, ...viewport }
                    });
                }

                _onHover({ x, y, object }) {
                    this.setState({ x, y, hoveredObject: object });
                }

                _onMouseMove(evt) {
                    if (evt.nativeEvent) {
                        this.setState({ mousePosition: [evt.nativeEvent.offsetX, evt.nativeEvent.offsetY] });
                    }
                }

                _onMouseEnter() {
                    this.setState({ mouseEntered: true });
                }

                _onMouseLeave() {
                    this.setState({ mouseEntered: false });
                }

                _renderTooltip() {
                    const { x, y, hoveredObject } = this.state;

                    if (!hoveredObject) {
                        return null;
                    }

                    var tooltipExists = !!document.getElementById('tooltip');

                    var hoveredObjectHTML = hoveredObject.address;

                    if (tooltipExists) {
                        document.getElementById('tooltip').style.position = "absolute";
                        document.getElementById('tooltip').style.zIndex = 99999;
                        document.getElementById('tooltip').style.color = '#fff';
                        document.getElementById('tooltip').style.background = 'rgba(0, 0, 0, 0.8)';
                        document.getElementById('tooltip').style.padding = '4px';
                        document.getElementById('tooltip').style.fontSize = '10px';
                        document.getElementById('tooltip').style.maxWidth = '300px';
                        document.getElementById('tooltip').style.left = x + 'px';
                        document.getElementById('tooltip').style.top = y + 'px';
                        document.getElementById('tooltip').style.cursor = 'pointer';
                        document.getElementById('tooltip').setAttribute('text-decoration', 'none!important');
                        console.log(hoveredObject);
                    }

                    return ( < div id = "tooltip"
                        style = {
                            { left: x, top: y }
                        } >
                        <
                        div > { 'Index: ' + hoveredObject.index } < /div> <
                        div > { 'Longitude: ' + hoveredObject.centroid[0] } < /div> <
                        div > { 'Latitude: ' + hoveredObject.centroid[1] } < /div> <
                        div > { 'Elevation: ' + hoveredObject.elevationValue } < /div> <
                        div > { 'Color: ' + hoveredObject.colorValue } < /div> <
                        div > { 'Points: ' + hoveredObject.points.length } < /div> <
                        div > { 'Test value: ' + hoveredObject } < /div>  < /
                        div >
                    );
                }


                render() {
                    const { viewport, data, iconMapping, mousePosition, mouseEntered } = this.state;

                    return ( <
                        div onMouseMove = { this._onMouseMove.bind(this) }
                        onMouseEnter = { this._onMouseEnter.bind(this) }
                        onMouseLeave = { this._onMouseLeave.bind(this) } > { this._renderTooltip() } <
                        MapGL {...viewport }
                        mapStyle = "mapbox://styles/mapbox/dark-v9"
                        onViewportChange = { this._onViewportChange.bind(this) }
                        mapboxApiAccessToken = { MAPBOX_TOKEN } >
                        <
                        DeckGLOverlay viewport = { viewport }
                        data = { data || [] }
                        mousePosition = { mousePosition }
                        mouseEntered = { mouseEntered }
                        onHover = { this._onHover.bind(this) }
                        /> < /
                        MapGL >
                        <
                        /div>
                    );
                }
            }

            render( < Root / > , document.getElementById('mapHolder').appendChild(document.createElement('div')));


        } else {
            //update message

            newData = JSON.parse(newData);
            console.log(newData);

        }

    });
    socket.on('close', function() {});
});