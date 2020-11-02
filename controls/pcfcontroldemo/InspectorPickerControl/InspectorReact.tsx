import * as React from "react";
import AsyncSelect from 'react-select/async';

export interface IProps {
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

		var res = ob.map((e: { bookableresourceid: any; }) => e.bookableresourceid).join(",");
		this.setState({value : res });
		this.props.onChange(res);
	}

	loadOptions = async (inputValue: string) => {
		console.log(inputValue) 
		const res = this.props.onSearch(inputValue);
		console.log("returning" + JSON.stringify(res));
		return res;	
	}	
	
	public render(): JSX.Element 
	{
		
		const styles = {
			menu: (base: any) => ({
			  ...base,
			  flex: 1,	
			  flexDirection: 'row',
			  position: 'static'
			})
		  };
		
        return (
			<div>
			<AsyncSelect
			isMulti={true}
			styles={styles}
			getOptionLabel={e => e.name}
			getOptionValue={e => e.bookableresourceid}
			loadOptions={this.loadOptions}
			defaultOptions
			minMenuHeight={300}
			onChange={this.onChange}		
			/></div>
        );
	}
}