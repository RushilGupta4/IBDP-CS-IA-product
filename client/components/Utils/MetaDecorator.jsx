import PropTypes from 'prop-types'
import Head from 'next/head'

const MetaDecorator = ({ title, description }) => (
  <Head>
    <title>VondrInvesting - {title}</title>
    <meta property={'description'} content={description} />
  </Head>
)

export default MetaDecorator

MetaDecorator.propTypes = {
  description: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}
