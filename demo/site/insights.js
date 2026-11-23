Fieldnotes.page("insights",function initialize() {
  const { notify }=Fieldnotes

  const monthlyData=[
    ["Period","Completed","Planned"],
    ["Jun",58,70],
    ["Jul",75,85],
    ["Aug",68,80],
    ["Sep",96,100],
    ["Oct",108,120],
    ["Nov",128,135],
  ]

  const weeklyData=[
    ["Period","Completed","Planned"],
    ["Week 1",26,30],
    ["Week 2",34,36],
    ["Week 3",29,32],
    ["Week 4",39,42],
  ]

  function configureChart(chart,source) {
    chart.tableSource=source
    chart.option={
      animation: !matchMedia("(prefers-reduced-motion: reduce)").matches,
      color: ["#6e9171","#c5d3b6"],
      tooltip: { trigger: "axis" },
      legend: { bottom: 0 },
      grid: { top: 24,left: 44,right: 20,bottom: 55 },
      dataset: { source },
      xAxis: { type: "category",boundaryGap: false },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#eef0e9" } },
      },
      series: [
        {
          name: "Completed",
          type: "line",
          smooth: true,
          areaStyle: { opacity: 0.14 },
          encode: { x: "Period",y: "Completed" },
        },
        {
          name: "Planned",
          type: "line",
          smooth: true,
          lineStyle: { type: "dashed" },
          encode: { x: "Period",y: "Planned" },
        },
      ],
    }
  }

  function createActivityData() {
    const activity=[]

    for(let index=0;index<122;index++) {
      const date=new Date(Date.UTC(2026,7,index+1))
      const dayOfWeek=date.getUTCDay()
      const isWeekend=dayOfWeek===0||dayOfWeek===6

      activity.push({
        date: date.toISOString().slice(0,10),
        value: isWeekend? 0:(index*7+3)%12,
      })
    }

    return activity
  }

  MarkupUIAll.chart.configureChartEngine(echarts)
  const chart=new MarkupUIAll.chart.Chart()
  chart.id="delivery-chart"
  chart.height=280
  chart.setAttribute("aria-label","Completed studio tasks over time")
  configureChart(chart,monthlyData)
  document.getElementById("chart-mount").append(chart)
  const reportPeriod=document.getElementById("report-period")
  const periodLabel = document.getElementById("period-label").control
  const activityHeatmap=document.getElementById("activity-heatmap")
  const heatmapStatus=document.getElementById("heatmap-status")
  const focusTarget=document.getElementById("focus-target")
  const focusLabel=document.getElementById("focus-label")
  const focusProgress=document.getElementById("focus-progress")
  const focusNote=document.getElementById("focus-note")
  const reflectionTimer=document.getElementById("reflection-timer")
  const pauseButton=document.getElementById("pause-reflection")
  let isTimerPaused=false

  function getReportData() {
    return reportPeriod.value==="week"? weeklyData:monthlyData
  }

  function updateChart() {
    configureChart(chart,getReportData())
    periodLabel.textContent=reportPeriod.value==="week"? "By week":"By month"
  }

  function showActivityDetails(event) {
    const date=event.detail.date??event.detail.cell?.date
    if(date) {
      const record=activityHeatmap.data.find(item => item.date===date)
      heatmapStatus.textContent=`${date}: ${record?.value??0} sample tasks completed.`
    }
  }

  function updateFocusTarget() {
    const hours=Number(focusTarget.value)
    focusLabel.textContent=`${hours} hours / week`
    focusProgress.percentage=hours/40*100
    focusNote.textContent=
      `${40-hours} hours left for collaboration, learning, and a little breathing room.`
  }

  function toggleReflectionTimer() {
    isTimerPaused=!isTimerPaused

    if(isTimerPaused) {
      reflectionTimer.pause()
    } else {
      reflectionTimer.start()
    }

    pauseButton.textContent=isTimerPaused? "Resume timer":"Pause timer"
  }

  function exportReport() {
    const rows=getReportData()
    const csv=rows.map(row => row.join(",")).join("\r\n")
    const blob=new Blob([csv],{ type: "text/csv;charset=utf-8" })
    const url=URL.createObjectURL(blob)
    const link=document.createElement("a")
    link.href=url
    link.download="fieldnotes-sample-report.csv"
    link.click()

    setTimeout(() => URL.revokeObjectURL(url),1000)
    notify("Sample report exported as CSV.")
  }

  activityHeatmap.settings={
    range: ["2026-08-01","2026-11-30"],
    colorTheme: "green",
    size: "small",
  }
  activityHeatmap.data=createActivityData()
  reflectionTimer.start()

  m(reportPeriod).on("m:change",updateChart)
  m(activityHeatmap).on("m:heatmap-explore",showActivityDetails)
  m(focusTarget).on("input",updateFocusTarget)
  m(pauseButton).on("click",toggleReflectionTimer)
  m("#export-report").on("click",exportReport)
})
