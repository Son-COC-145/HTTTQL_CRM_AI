import { useEffect, useState } from "react";
import api from "../api/api";

function AIAnalysis() {
    const [customers, setCustomers] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get("/customers")
            .then((res) => setCustomers(res.data))
            .catch(console.error);
    }, []);

    const analyzeCustomer = async (customerId) => {
        try {
            setLoading(true);

            const res = await api.post(`/ai/analyze-customer/${customerId}`);

            setResult(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>AI Customer Analysis</h1>

            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Khách hàng</th>
                        <th>Điểm AI</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>

                <tbody>
                    {customers.map((customer) => (
                        <tr key={customer.id}>
                            <td>{customer.fullName}</td>
                            <td>{customer.potentialScore}</td>

                            <td>
                                <button onClick={() => analyzeCustomer(customer.id)}>
                                    Phân tích AI
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {loading && <p>Đang phân tích...</p>}

            {result && (
                <div style={{marginTop: "20px", border: "1px solid #ccc", padding: "20px",}}>
                    <h2>Kết quả AI</h2>

                    <p>
                        <strong>Điểm:</strong>{" "}
                        {result.potentialScore}
                    </p>

                    <p>
                        <strong>Level:</strong>{" "}
                        {result.level}
                    </p>

                    <p>
                        <strong>Tóm tắt:</strong>
                        {result.summary}
                    </p>

                    <p>
                        <strong>Đề xuất:</strong>{" "}
                        {result.suggestedAction}
                    </p>
                </div>
            )}
        </div>
    );
}

export default AIAnalysis;