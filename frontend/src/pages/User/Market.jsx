import Button from '../../components/Button'
import TradingDashboard from '../../components/TradingDashboard'
const Market = () => {
    return (
        <div className=" h-screen  mt-10">
            <h1>Pages Market</h1>
            <div>
                <TradingDashboard />
            </div>
            <div className="flex gap-4 mt-3">
                <Button type="Buy" color="green" />
                <Button type="sell" color="red" />
            </div>
        </div>
    )
}

export default Market
