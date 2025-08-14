import { useState } from "react";

type FieldType = "text" | "number" | "select";

interface FieldConfig {
  label: string;
  render: (value: string, onChange: (v: string) => void) => React.ReactNode;
  validate: (value: string) => string | null;
}

interface Field {
  id: number;
  label: string;
  type: FieldType;
  value: string;
  error: string | null;
}

const fieldTypes: Record<FieldType, FieldConfig> = {
  text: {
    label: "Строка",
    render: (value, onChange) => (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ),
    validate: (value) => {
      if (!value.length) return "Обязательное поле";
      else return null;
    },
  },
  number: {
    label: "Числа",
    render: (value, onChange) => (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ),
    validate: (value) => {
      if (!value.length) return "Обязательное поле";
      else if (value && isNaN(Number(value)))
        return "Значение должно быть числом";
      else return null;
    },
  },
  select: {
    label: "Список",
    render: (value, onChange) => (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Выберите</option>
        <option value="Опция 1">Опция 1</option>
        <option value="Опция 2">Опция 2</option>
        <option value="Опция 3">Опция 3</option>
      </select>
    ),
    validate: (value) => {
      if (!value.length) return "Обязательное поле";
      else return null;
    },
  },
};

const App = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("text");
  const [message, setMessage] = useState("");

  const addField = () => {
    if (!newFieldLabel.trim()) {
      alert("Введите название поля");
      return;
    }
    setFields((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: newFieldLabel,
        type: newFieldType,
        value: "",
        error: null,
      },
    ]);
    setNewFieldLabel("");
  };

  const updateField = (
    id: number,
    key: keyof Omit<Field, "id" | "type">,
    value: string
  ) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id
          ? {
              ...field,
              [key]: value,
              ...(key === "value"
                ? { error: fieldTypes[field.type].validate(value) }
                : {}),
            }
          : field
      )
    );
  };

  const updateLabel = (id: number) => {
    const newLabel = prompt(
      "Новое имя поля",
      fields.find((field) => field.id === id)?.label
    );
    if (newLabel) updateField(id, "label", newLabel);
  };

  const removeField = (id: number) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const saveForm = () => {
    let hasError = false;
    const updated = fields.map((field) => {
      const err = fieldTypes[field.type].validate(field.value);
      if (err) hasError = true;
      return { ...field, error: err };
    });
    setFields(updated);
    setMessage(
      hasError ? "Форма заполнена некорректно" : "Форма заполнена успешно!"
    );
  };

  const updateType = (e: React.ChangeEvent<HTMLSelectElement>, id: number) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id
          ? {
              ...field,
              type: e.target.value as FieldType,
              value: "",
            }
          : field
      )
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Конструктор формы</h2>
      <div style={{ marginBottom: 20 }}>
        <select
          value={newFieldType}
          onChange={(e) => setNewFieldType(e.target.value as FieldType)}
        >
          {Object.entries(fieldTypes).map(([key, type]) => (
            <option key={key} value={key}>
              {type.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Название поля"
          value={newFieldLabel}
          onChange={(e) => setNewFieldLabel(e.target.value)}
          style={{ marginLeft: 8 }}
        />
        <button onClick={addField} style={{ marginLeft: 8 }}>
          Добавить
        </button>
      </div>
      <form>
        {fields.map((field) => (
          <div
            key={field.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <label>{field.label}:</label>
            {fieldTypes[field.type].render(field.value, (val) =>
              updateField(field.id, "value", val)
            )}
            <button type="button" onClick={() => updateLabel(field.id)}>
              Переименовать
            </button>
            <select
              value={field.type}
              onChange={(e) => updateType(e, field.id)}
            >
              <option value="">Выберите</option>
              {Object.keys(fieldTypes).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => removeField(field.id)}>
              Удалить
            </button>
            {field.error && (
              <span style={{ color: "red", fontSize: "14px" }}>
                {field.error}
              </span>
            )}
          </div>
        ))}
      </form>
      <button type="button" onClick={saveForm}>
        Сохранить
      </button>
      {message && (
        <p
          style={{
            color: message.includes("некорректно") ? "red" : "green",
            marginTop: 10,
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default App;
