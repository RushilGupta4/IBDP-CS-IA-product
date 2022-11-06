import React from 'react';
import PropTypes from "prop-types";

function AxiosDataHandler({successComponent, loadingComponent, errorComponent, axiosData}) {
	// to get intellisense as a component
	const LoadingComponent = loadingComponent
	const ErrorComponent = errorComponent
	
	return (
		<React.Fragment>
			{axiosData.error && <ErrorComponent data={axiosData.errorMessage}/>}

			{axiosData.loading && <LoadingComponent/>}

			{axiosData.data && successComponent({data: axiosData.data})}
		</React.Fragment>
	);
}

AxiosDataHandler.propTypes = {
	successComponent: PropTypes.func.isRequired,
	loadingComponent: PropTypes.func,
	errorComponent: PropTypes.func,
	axiosData: PropTypes.object.isRequired
}

AxiosDataHandler.defaultProps = {
	errorComponent: ({data}) => <p>{data}</p>,
	loadingComponent: () => <p>Loading...</p>
}


export default AxiosDataHandler;