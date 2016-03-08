import React from 'react';
import classNames from 'classnames';

const ServerAdd = React.createClass({
	getInitialState() {
		return {
			title: '',
			key: '',
			secret: ''
		};
	},

	render() {
		let cancelButtonClassNames = classNames( 'btn', 'btn-warning' );

		let addButtonClassNames = classNames( 'btn', 'btn-success', {
			'disabled': ! this.allValuesFilled()
		});

		return (
			<div className="chcp-serverselect">
				<div className="chcp-serverselect-addform">
					<fieldset className="form-group">
						<label htmlFor="input-server-title">Server Title</label>
						<input type="text" id="input-server-title" className="form-control"
							placeholder="The Best Server in the Universe..."
							onChange={ this.handleServerTitleChange }
							/>
					</fieldset>
					<fieldset className="form-group">
						<label htmlFor="input-server-key">API Key</label>
						<input type="text" id="input-server-key" className="form-control"
							placeholder="...@Instance.playat.ch"
							onChange={ this.handleServerKeyChange }
							/>
					</fieldset>
					<fieldset className="form-group">
						<label htmlFor="input-server-secret">API Secret</label>
						<input type="text" id="input-server-secret" className="form-control"
							placeholder="..."
							onChange={ this.handleServerSecretChange }
							/>
					</fieldset>
				</div>
				<div className="chcp-serverselect-controls">
					<div className="controlsgroup controlsgroup-left">
						<button type="button"
							className={ cancelButtonClassNames }
							onClick={ this.handleCancelClick }
							>
							Cancel
						</button>
					</div>
					<div className="controlsgroup controlsgroup-right">
						<button type="button"
							className={ addButtonClassNames }
							onClick={ this.handleAddClick }
							>
							Add This Server
						</button>
					</div>
				</div>
			</div>
		);
	},

	allValuesFilled() {
		return !! this.state.title && !! this.state.key && !! this.state.secret;
	},

	handleServerTitleChange( event ) {
		this.setState({
			title: event.target.value
		});
	},

	handleServerKeyChange( event ) {
		this.setState({
			key: event.target.value
		});
	},

	handleServerSecretChange( event ) {
		this.setState({
			secret: event.target.value
		});
	},

	handleCancelClick( event ) {
		this.props.onCancel();
	},

	handleAddClick( event ) {
		let server = {
			title: this.state.title.trim(),
			key: this.state.key.trim(),
			secret: this.state.secret.trim()
		};

		this.setState({
			title: '',
			key: '',
			secret: ''
		});

		this.props.onAddServer( server );
	}
});

export default ServerAdd;
