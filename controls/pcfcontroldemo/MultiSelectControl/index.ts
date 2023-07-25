import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { IProps, MultiSelectControl } from "./MultiSelect";
import { defaultProps } from "react-select/src/Select";
import { debug } from "console";

export class MultiSelectPCFControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _existingValues: any
	private _value: any;
	private _notifyOutputChanged: () => void;
	private _container: HTMLDivElement;
	private props: IProps =
		{
			value: "",
			onChange: this.notifyChange.bind(this),
			onSearch: this.notifySearch.bind(this),
			initialValues: undefined,
			records: [],
			displayValueField: "",
			displayFieldLabel: "",
			columns: "",
			topCount: "",
			filterField: "",
			entityName: "",
			isControlVisible: true,
			isControlDisabled: true
		};
	private _context: ComponentFramework.Context<IInputs>;

	/**
	 * Empty constructor.
	 */
	constructor() {

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
	 */
	public async init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
		// Add control initialization code
		this._context = context;
		this._notifyOutputChanged = notifyOutputChanged;
		this._container = document.createElement("div");
		this.props.value = context.parameters.sampleProperty.raw || "";
		this.props.entityName = context.parameters.entityName.raw || "";
		this.props.filterField = context.parameters.filterField.raw || "";
		this.props.topCount = context.parameters.topCount.raw || "";
		this.props.columns = context.parameters.columns.raw || "";
		this.props.displayFieldLabel = context.parameters.displayFieldLabel.raw || "";
		this.props.displayValueField = context.parameters.displayValueField.raw || "";

		if (this.props.value.length > 0) {
			try {
				this.props.initialValues = await this.onLoad();
				console.log(JSON.stringify(this.props.initialValues));
			} catch (error) {
				this.props.initialValues = [];
				console.log(error)
			}
			this.updateView(context);
		}
		else {
			this.props.initialValues = [];
		}

		container.appendChild(this._container);

	}

	notifyChange(newValue: string) {
		this._value = newValue;
		this._notifyOutputChanged();
		console.log("notifyChange");
	}

	async notifySearch(newValue: string) {
		console.log("called notifySearch");
		console.log(this.props.entityName, `?$select=${this.props.columns}&$filter=contains(${this.props.filterField}, '${newValue}')&$top=${this.props.topCount}`);

		return this._context.webAPI.retrieveMultipleRecords(this.props.entityName, `?$select=${this.props.columns}&$filter=contains(${this.props.filterField}, '${newValue}')&$top=${this.props.topCount}`)
			.then(function (results) {
				return results?.entities;
			})
	}

	//Load previous values
	public async onLoad() {
		let count = 0;
		let qs = `?$select=${this.props.columns}&$filter=`;

		this.props.value.split(",").forEach(c => {
			if (count > 0) {
				qs += ` or ${this.props.displayValueField} eq '${c}'`;
			}
			else {
				qs += ` ${this.props.displayValueField} eq '${c}'`;
			}
			count++;
		});

		console.log("querystring is " + qs);

		return this._context.webAPI.retrieveMultipleRecords(this.props.entityName, qs)
			.then(function (results) {
				return results?.entities;
			});
	}

	private renderElement() {
		if (this.props.initialValues != undefined) {
			this.props.isControlDisabled = this._context.mode.isControlDisabled;
			this.props.isControlVisible = this._context.mode.isVisible;

			ReactDOM.render(
				React.createElement(MultiSelectControl, this.props)
				, this._container
			);
			console.log("viewUpdated");
		}

	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		// Add code to update control view
		this._value = context.parameters.sampleProperty.raw;
		this.props.value = this._value;

		this.props.topCount = context.parameters.topCount.raw;
		this.props.columns = context.parameters.columns.raw;
		this.props.filterField = context.parameters.filterField.raw;
		this.props.displayFieldLabel = context.parameters.displayFieldLabel.raw;
		this.props.displayValueField = context.parameters.displayValueField.raw;
		this.props.entityName = context.parameters.entityName.raw;

		this.renderElement();
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		console.log("getoutputs");

		return {
			sampleProperty: this._value
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
	}
}
