export default function RecordTable({ records, onEdit }) {
  return (
    <section className="panel">
      <h2>Bệnh án của tôi</h2>
      {records.length === 0 ? (
        <p className="empty">Bạn chưa có bệnh án nào. Hãy tạo bệnh án đầu tiên ở form phía trên.</p>
      ) : (
        <div className="scroll">
          <table>
            <thead><tr><th>Mã bệnh án</th><th>Bệnh nhân</th><th>Chẩn đoán</th><th>Hash</th><th></th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.ma_benh_an}>
                  <td>{r.ma_benh_an}</td>
                  <td>{r.ten_benh_nhan}<br /><small>{r.ma_ho_so}</small></td>
                  <td>{r.chan_doan}</td>
                  <td className="mono" title={r.ma_hash}>{r.ma_hash ? r.ma_hash.slice(0, 10) + "..." : "-"}</td>
                  <td className="actions"><button className="ghost" onClick={() => onEdit(r)}>Sửa</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
