import { useBrowserLocation } from './useBrowserLocation';

const Demo = () => {
	const location = useBrowserLocation()

	return (
		<div className='overflow-auto'>
			<input
				value={location.hash}
				onChange={e => {
					location.setLocation({ hash: e.target.value })
				}}
				placeholder='Hash'
			/>
			<pre>{JSON.stringify(location, null, 2)}</pre>
		</div>
	)
}

export default Demo
