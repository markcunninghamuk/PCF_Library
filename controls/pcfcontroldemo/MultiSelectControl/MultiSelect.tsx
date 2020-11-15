import * as React from "react";
import AsyncSelect from 'react-select/async';

export interface IProps {
	isControlVisible: boolean;
	isControlDisabled: boolean;
	displayValueField: any;
	displayFieldLabel: any;
	columns: any;
	topCount: any;
	filterField: any;
	entityName: any;
    value: string;
	onChange: (value:string) => void;
	onSearch: (value:string) => void;
	records: any
}

export interface IState {
    value: string;
}

export class MultiSelectControl extends React.Component<IProps, IState> {
			
    constructor(props: Readonly<IProps>) {
		super(props);
		this.state = { value: props.value};     
    }

	componentWillReceiveProps(p: IProps) 
	{
		this.setState({value : (p.value)});
		console.log("react props");
    }

	onChange = (ob: any) =>
	{
		if (ob == null) {
			this.setState({value : "" });
			this.props.onChange("");
			return;
		};

		var res = ob.map((e: any) => e[this.props.displayValueField]).join(",");

		this.setState({value : res });
		this.props.onChange(res);
	}

	loadOptions = async (inputValue: string) => {
		const res = this.props.onSearch(inputValue);
		console.log("returning" + JSON.stringify(res));
		return res;		
	}	
	
	public render(): JSX.Element 
	{		
		const selectStyles = { menuPortal: (zindex: any) => ({ ...zindex, zIndex: 9999}) };

		if (this.props.isControlVisible)
		{
        return (
			<div>
			<AsyncSelect
			isMulti={true}
			menuPortalTarget={document.body}
			styles={selectStyles}
			getOptionLabel={e => e[this.props.displayFieldLabel]}
			getOptionValue={e => e[this.props.displayValueField]}
			loadOptions={this.loadOptions}
			defaultOptions
			isDisabled={this.props.isControlDisabled}
			onChange={this.onChange}		
			/></div>
		)
		}
		else{
			return (<></>);
		};
	}
}