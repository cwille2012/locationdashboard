Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';
// -- Area Chart Example
// var ctx = document.getElementById("myAreaChart");
// var myLineChart = new Chart(ctx, {
//     type: 'line',
//     data: {
//         labels: ["Jan 12", "Jan 13", "Jan 14", "Jan 15", "Jan 16", "Jan 17", "Jan 18", "Jan 19"],
//         datasets: [{
//             label: "Zcash (ZEC)",
//             lineTension: 0.3,
//             backgroundColor: "rgba(2,117,216,0.2)",
//             borderColor: "rgba(2,117,216,1)",
//             pointRadius: 5,
//             pointBackgroundColor: "rgba(2,117,216,1)",
//             pointBorderColor: "rgba(255,255,255,0.8)",
//             pointHoverRadius: 5,
//             pointHoverBackgroundColor: "rgba(2,117,216,1)",
//             pointHitRadius: 20,
//             pointBorderWidth: 2,
//             data: [651.18,703.76,701.85,671.73,627.14,509.27,497.68,486.59],
//         },
//         {
//             label: "Ethereum (ETH)",
//             lineTension: 0.3,
//             backgroundColor: "rgba(2,117,216,0.2)",
//             borderColor: "rgba(2,117,216,1)",
//             pointRadius: 5,
//             pointBackgroundColor: "rgba(2,117,216,1)",
//             pointBorderColor: "rgba(255,255,255,0.8)",
//             pointHoverRadius: 5,
//             pointHoverBackgroundColor: "rgba(2,117,216,1)",
//             pointHitRadius: 20,
//             pointBorderWidth: 2,
//             data: [1158.29,1270.47,1397.48,1365.21,1292.63,1061.34,1016.44,1028.82],
//         },
//         {
//             label: "Litecoin (LTC)",
//             lineTension: 0.3,
//             backgroundColor: "rgba(2,117,216,0.2)",
//             borderColor: "rgba(2,117,216,1)",
//             pointRadius: 5,
//             pointBackgroundColor: "rgba(2,117,216,1)",
//             pointBorderColor: "rgba(255,255,255,0.8)",
//             pointHoverRadius: 5,
//             pointHoverBackgroundColor: "rgba(2,117,216,1)",
//             pointHitRadius: 20,
//             pointBorderWidth: 2,
//             data: [236.88,260.58,237.29,232.82,190.15,188.33,186.95,191.19],
//         },
//         {
//             label: "Monero (XMR)",
//             lineTension: 0.3,
//             backgroundColor: "rgba(2,117,216,0.2)",
//             borderColor: "rgba(2,117,216,1)",
//             pointRadius: 5,
//             pointBackgroundColor: "rgba(2,117,216,1)",
//             pointBorderColor: "rgba(255,255,255,0.8)",
//             pointHoverRadius: 5,
//             pointHoverBackgroundColor: "rgba(2,117,216,1)",
//             pointHitRadius: 20,
//             pointBorderWidth: 2,
//             data: [358.62,393.04,420.34,396.02,415.93,318.93,320.61,314.13,],
//         },
//         {
//             label: "Ripple (XRP)",
//             lineTension: 0.3,
//             backgroundColor: "rgba(2,117,216,0.2)",
//             borderColor: "rgba(2,117,216,1)",
//             pointRadius: 5,
//             pointBackgroundColor: "rgba(2,117,216,1)",
//             pointBorderColor: "rgba(255,255,255,0.8)",
//             pointHoverRadius: 5,
//             pointHoverBackgroundColor: "rgba(2,117,216,1)",
//             pointHitRadius: 20,
//             pointBorderWidth: 2,
//             data: [1098.06,1006.43,988.49,937.57,760.39,758.29,800.02,833.31,],
//         }
//     ],
//     },
//     options: {
//         scales: {
//             xAxes: [{
//                 time: {
//                     unit: 'date'
//                 },
//                 gridLines: {
//                     display: false
//                 },
//                 ticks: {
//                     maxTicksLimit: 7
//                 }
//             }],
//             yAxes: [{
//                 ticks: {
//                     min: 0,
//                     maxTicksLimit: 5
//                 },
//                 gridLines: {
//                     color: "rgba(0, 0, 0, .125)",
//                 }
//             }],
//         },
//         legend: {
//             display: false
//         }
//     }
// });
// -- Bar Chart Example
// var ctx = document.getElementById("myBarChart");
// var myLineChart = new Chart(ctx, {
//     type: 'bar',
//     data: {
//         labels: ["August", "September", "October", "November", "December", "January"],
//         datasets: [{
//             label: "Balance",
//             backgroundColor: "#28a745",
//             borderColor: "#28a745",
//             data: [14984, 9821, 7841, 6251, 5312, 4215],
//         }],
//     },
//     options: {
//         scales: {
//             xAxes: [{
//                 time: {
//                     unit: 'month'
//                 },
//                 gridLines: {
//                     display: false
//                 },
//                 ticks: {
//                     maxTicksLimit: 6
//                 }
//             }],
//             yAxes: [{
//                 ticks: {
//                     min: 0,
//                     max: 15000,
//                     maxTicksLimit: 5
//                 },
//                 gridLines: {
//                     display: true
//                 }
//             }],
//         },
//         legend: {
//             display: false
//         }
//     }
// });
// -- Pie Chart Example
// var ctx = document.getElementById("myPieChart");
// var myPieChart = new Chart(ctx, {
//     type: 'pie',
//     data: {
//         labels: ["Entertainment", "Liesure", "Living Expenses", "Other"],
//         datasets: [{
//             data: [12.21, 15.58, 11.25, 8.32],
//             backgroundColor: ['#007bff', '#ffc107', '#28a745', '#dc3545'],
//         }],
//     },
// });