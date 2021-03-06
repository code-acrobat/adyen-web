import { Component, h } from 'preact';
import Iframe from '../../../internal/IFrame';
import Spinner from '../../../internal/Spinner';
import ThreeDS2Form from '../Form';
import promiseTimeout from '../../../../utils/promiseTimeout';
import getProcessMessageHandler from '../../../../utils/get-process-message-handler';
import { FAILED_METHOD_STATUS_RESOLVE_OBJECT, THREEDS_METHOD_TIMEOUT, FAILED_METHOD_STATUS_RESOLVE_OBJECT_TIMEOUT } from '../../config';
import { encodeBase64URL } from '../utils';

const iframeName = 'threeDSMethodIframe';

/**
 * Create and Base64URL encode a JSON object containing the serverTransactionID & threeDSMethodNotificationURL.
 * This Base64URL string will be added to the <form> in the ThreeDS2Form component.
 * The ThreeDS2Form component will submit the <form> when it mounts, using the ThreeDS2Iframe as the <form> target.
 * getProcessMessageHandler will listen for the postMessage response from the notificationURL and will settle the
 * promise accordingly causing this component to call the appropriate callback.
 * The callbacks exist in the parent component: ThreeDS2DeviceFingerprint where they ultimately call the onComplete
 * function passed as a prop when checkout.create('threeDS2DeviceFingerprint') is called.
 */
class Get3DS2DeviceFingerprint extends Component {
    constructor(props) {
        super(props);

        /**
         * Create and Base64URL encode a JSON object
         */
        const dataObj = {
            threeDSServerTransID: this.props.serverTransactionID,
            threeDSMethodNotificationURL: this.props.threedsMethodNotificationURL
        };

        const jsonStr = JSON.stringify(dataObj);
        const base64URLencodedData = encodeBase64URL(jsonStr);
        this.setState({ base64URLencodedData });
    }

    static defaultProps = {
        showSpinner: true
    };

    get3DS2MethodPromise() {
        return new Promise((resolve, reject) => {
            /**
             * Listen for postMessage responses from the notification url
             */
            this.processMessageHandler = getProcessMessageHandler(
                this.props.postMessageDomain,
                resolve,
                reject,
                FAILED_METHOD_STATUS_RESOLVE_OBJECT,
                'fingerPrintResult'
            );

            /* eslint-disable-next-line */
            window.addEventListener('message', this.processMessageHandler);
        });
    }

    componentDidMount() {
        // Check 3DS2 Device fingerprint
        this.fingerPrintPromise = promiseTimeout(THREEDS_METHOD_TIMEOUT, this.get3DS2MethodPromise(), FAILED_METHOD_STATUS_RESOLVE_OBJECT_TIMEOUT);
        this.fingerPrintPromise.promise
            .then(resolveObject => {
                window.removeEventListener('message', this.processMessageHandler);
                this.props.onCompleteFingerprint(resolveObject);
            })
            .catch(rejectObject => {
                window.removeEventListener('message', this.processMessageHandler);
                this.props.onErrorFingerprint(rejectObject);
            });
    }

    componentWillUnmount() {
        this.fingerPrintPromise.cancel();
        window.removeEventListener('message', this.processMessageHandler);
    }

    render({ methodURL }, { base64URLencodedData }) {
        return (
            <div className="adyen-checkout__3ds2-device-fingerprint">
                {this.props.showSpinner && <Spinner />}
                <div style={{ display: 'none' }}>
                    <Iframe name={iframeName} />
                    <ThreeDS2Form
                        name={'threeDSMethodForm'}
                        action={methodURL}
                        target={iframeName}
                        inputName={'threeDSMethodData'}
                        inputValue={base64URLencodedData}
                    />
                </div>
            </div>
        );
    }
}

export default Get3DS2DeviceFingerprint;
