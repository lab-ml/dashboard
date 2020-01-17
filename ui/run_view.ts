
import { ROUTER, SCREEN } from "./app"
import { Weya as $, WeyaElement } from "./weya/weya"
import { Run } from "./experiments"
import { getExperiments } from "./cache"
import { KeyValue } from "./view_components/key_value"
import { RunUI } from "./run_ui"
import { renderConfigs } from "./configs"

class RunView {
    run: Run
    runUI: RunUI
    elem: WeyaElement
    tensorboardBtn: HTMLButtonElement
    indicatorsView: HTMLDivElement
    experimentName: string
    runIndex: string
    runView: HTMLDivElement
    configsView: HTMLDivElement

    constructor(experimentName: string, runIndex: string) {
        this.experimentName = experimentName
        this.runIndex = runIndex
    }

    render() {
        getExperiments().then((experiments) => {
            let experiment = experiments.experiments[this.experimentName]
            this.run = experiment.getRun(this.runIndex)
            this.runUI = new RunUI(this.run)
            this.renderRun()
            this.renderIndicators()
            this.renderConfigs()
        })

        this.elem = <HTMLElement>$('div.container', $ => {
            this.runView = <HTMLDivElement>$('div.run_single', '')
        })
        return this.elem
    }

    renderRun() {
        let info = this.run.info

        $(this.runView, $ => {
            $('h1', $ => {
                $('label', `${this.run.experimentName}`)
                $('span', ' - ')
                $('label', `${info.index}`)
                if (info.comment.trim() !== "") {
                    $('span', ':')
                    $('span', info.comment)
                }
            })
            $('div', $ => {
                $('i.fa.fa-history.key_icon')
                $('span', ` ${info.commit_message}`)
            })
            $('div', $ => {
                $('i.fa.fa-calendar.key_icon')
                $('span', ` ${info.trial_date} `)
                $('span.key_split', '')
                $('i.fa.fa-clock.key_icon')
                $('span', ` ${info.trial_time}`)
            })


            $('div.block', $ => {
                if (info.is_dirty) {
                    new KeyValue('.mono').render($, 'Commit', info.commit)
                } else {
                    new KeyValue('.mono').render($, 'Commit', `${info.commit}*`)
                }
                new KeyValue('.mono').render($, 'Python File', info.python_file)
            })

            this.indicatorsView = <HTMLDivElement>$('div.indicators.block')

            this.configsView = <HTMLDivElement>$('div.configs.block')

            this.tensorboardBtn = <HTMLButtonElement>$('button', 'Launch Tensorboard', {
                on: {
                    click: this.onTensorboardClick
                }
            })
        })


        return this.elem
    }

    private onTensorboardClick = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()

        this.runUI.launchTensorboard().then(() => {
            window.open('http://localhost:6006', '_blank')
        })
    }

    async renderIndicators() {
        // let indicators: Indicators = await this.runUI.getIndicators()
        let values: any = await this.runUI.getValues()

        $(this.indicatorsView, $ => {
            let maxStep = 0
            for (let k in values) {
                new KeyValue('.highlight.mono').render($, k, `${values[k].value}`)
                maxStep = Math.max(values[k].step, maxStep)
            }
            new KeyValue('.highlight.mono').render($, 'step', `${maxStep}`)

            // for (let k in indicators.indicators) {
            //     new KeyValue().render($, k, `${indicators.indicators[k].type}`)
            // }
        })
    }

    async renderConfigs() {
        let configs = await this.runUI.getConfigs()
        renderConfigs(this.configsView, configs)
    }
}

export class RunHandler {
    constructor() {

        ROUTER.route('experiment/:name/:runIndex', [this.handleRun])
    }

    handleRun = (name: string, runIndex: string) => {
        SCREEN.setView(new RunView(name, runIndex))
        console.log("test")
    }
}