import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import PaypalButtons from './PaypalButtons';
import Spinner from '../../internal/Spinner';
import useCoreContext from '../../../core/Context/useCoreContext';
import { getPaypalUrl } from '../utils';
import { PayPalComponentProps } from '../types';

export default function PaypalComponent(props: PayPalComponentProps) {
    const { i18n } = useCoreContext();
    const [status, setStatus] = useState('pending');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    const handleComplete = data => {
        setStatus('processing');
        props.onComplete(data);
    };

    const handlePaypalLoad = () => {
        setStatus('ready');
    };

    useEffect(() => {
        const script = document.createElement('script');
        const paypalUrl = getPaypalUrl(props);
        script.async = true;
        script.onload = handlePaypalLoad;
        script.src = paypalUrl;
        document.body.appendChild(script);
    }, []);

    if (status === 'pending') {
        return (
            <div className="adyen-checkout__paypal">
                <div className="adyen-checkout__paypal__status adyen-checkout__paypal__status--pending">
                    <Spinner />
                </div>
            </div>
        );
    }

    if (status === 'processing') {
        return (
            <div className="adyen-checkout__paypal">
                <div className="adyen-checkout__paypal__status adyen-checkout__paypal__status--processing">
                    <Spinner size="medium" inline /> {i18n.get('paypal.processingPayment')}
                </div>
            </div>
        );
    }

    return (
        <div className="adyen-checkout__paypal">
            <PaypalButtons {...props} onComplete={handleComplete} paypalRef={window.paypal} />
        </div>
    );
}
