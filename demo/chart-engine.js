import { init, use } from "echarts/core"
import { BarChart, LineChart, PieChart, ScatterChart } from "echarts/charts"
import { AriaComponent, DatasetComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components"
import { CanvasRenderer, SVGRenderer } from "echarts/renderers"

use([BarChart, LineChart, PieChart, ScatterChart, AriaComponent, DatasetComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent, CanvasRenderer, SVGRenderer])

export { init }
