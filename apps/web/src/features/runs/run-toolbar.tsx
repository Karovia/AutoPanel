type RunToolbarProps = {
  disabled?: boolean;
  onRun?: () => void;
};

export function RunToolbar({ disabled = false, onRun }: RunToolbarProps) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <button
        disabled={disabled}
        onClick={onRun}
        style={{
          background: "#38bdf8",
          border: 0,
          borderRadius: 999,
          color: "#082f49",
          cursor: disabled ? "not-allowed" : "pointer",
          fontWeight: 700,
          padding: "12px 18px",
        }}
        type="button"
      >
        运行工作流
      </button>
    </div>
  );
}
