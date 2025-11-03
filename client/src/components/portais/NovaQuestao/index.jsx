import { useState, useEffect } from "react";
import "./style.css"; 


function contarPalavras(str = "") {
  return str.trim().split(/\s+/).filter(Boolean).length;
}


export default function NovaQuestao({ index, value, onChange, onRemove, onDuplicate }) {
  const [tipo, setTipo] = useState(value?.tipo || "dissertativa");

  
  useEffect(() => {
    onChange({ ...value, tipo });
  }, [tipo]);

  
  const atualizar = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="questao">
      
      <div className="questao-header">
        <strong>Questão {index + 1}</strong>
        <div className="opcao-questao">
          <button className="remover" type="button" onClick={onRemove}>
            Remover
          </button>
          <button className="duplicar" type="button" onClick={onDuplicate}>
            Duplicar
          </button>
        </div>
      </div>

     
      <label className="checkbox-questoes" style={{ marginTop: 4 }}>
        <input
          type="checkbox"
          checked={!!value?.obrigatoria}
          onChange={(e) => atualizar({ obrigatoria: e.target.checked })}
        />
        <span>Questão obrigatória</span>
      </label>

      
      <label>
        <p>Tipo da questão</p>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="dissertativa">Resposta escrita</option>
          <option value="multipla">Múltipla escolha</option>
          <option value="correspondencia">Correspondência de colunas</option>
        </select>
      </label>

     
      <label>
        <p>Enunciado</p>
        <textarea
          value={value?.enunciado || ""}
          onChange={(e) => atualizar({ enunciado: e.target.value })}
          rows={3}
        />
        <small>{contarPalavras(value?.enunciado)}/300 palavras máx</small>
      </label>

      <label>
        <p>Imagem (URL opcional)</p>
        <input
          type="text"
          value={value?.imagem?.url || ""}
          onChange={(e) => atualizar({ imagem: { url: e.target.value } })}
          placeholder="Cole a URL após upload (opcional)"
        />
      </label>

      
      {tipo === "dissertativa" && (
        <label>
          <p>Texto esperado (opcional)</p>
          <textarea
            value={value?.textoEsperado || ""}
            onChange={(e) => atualizar({ textoEsperado: e.target.value })}
            rows={2}
          />
          <small>{contarPalavras(value?.textoEsperado)}/300 palavras máx</small>
        </label>
      )}

      
      {tipo === "multipla" && (
        <div>
          <p>Alternativas</p>
          {(value?.alternativas || [{ id: crypto.randomUUID(), texto: "" }]).map((alt, i) => (
            <div key={alt.id} className="alt-row">
              <input
                type="text"
                value={alt.texto}
                onChange={(e) => {
                  const alts = [...(value.alternativas || [])];
                  alts[i] = { ...alt, texto: e.target.value };
                  atualizar({ alternativas: alts });
                }}
                placeholder={`Alternativa ${i + 1}`}
              />
              <label className="checkbox-questoes">
                <input
                  type="checkbox"
                  checked={!!alt.correta}
                  onChange={(e) => {
                    const alts = [...(value.alternativas || [])];
                    alts[i] = { ...alt, correta: e.target.checked };
                    atualizar({ alternativas: alts });
                  }}
                />
                Correta
              </label>
              <button
                className="remover"
                type="button"
                onClick={() => {
                  const alts = (value.alternativas || []).filter((a) => a.id !== alt.id);
                  atualizar({ alternativas: alts });
                }}
              >
                Remover
              </button>
            </div>
          ))}

          
          <button
            className="button"
            type="button"
            onClick={() => {
              const alts = [...(value.alternativas || []), { id: crypto.randomUUID(), texto: "" }];
              atualizar({ alternativas: alts });
            }}
          >
            + Alternativa
          </button>

          <label className="checkbox-questoes" style={{ marginTop: 8 }}>
            <p>Permitir mais de uma resposta correta?</p>
            <input
              type="checkbox"
              checked={!!value?.permiteMultiplas}
              onChange={(e) => atualizar({ permiteMultiplas: e.target.checked })}
            />
          </label>
        </div>
      )}

    
      {tipo === "correspondencia" && (
        <div className="corresp-grid">
         
          <div>
            <p>Coluna A</p>
            {(value?.colA || [""]).map((txt, i) => (
              <div key={`A-${i}`} className="pair-row">
                <input
                  type="text"
                  value={txt}
                  onChange={(e) => {
                    const arr = [...(value.colA || [])];
                    const antigo = arr[i];
                    arr[i] = e.target.value;

                
                    const novoGabarito = { ...(value.gabarito || {}) };
                    if (novoGabarito[antigo]) {
                      novoGabarito[e.target.value] = novoGabarito[antigo];
                      delete novoGabarito[antigo];
                    }

                    atualizar({ colA: arr, gabarito: novoGabarito });
                  }}
                  placeholder={`Item A${i + 1}`}
                />

               
                <select
                  value={value?.gabarito?.[txt] || ""}
                  onChange={(e) => {
                    const novoGabarito = { ...(value.gabarito || {}) };
                    novoGabarito[txt] = e.target.value;
                    atualizar({ gabarito: novoGabarito });
                  }}
                >
                  <option value="">— Escolher correspondência —</option>
                  {(value?.colB || [])
                    .filter(
                      (b) =>
                        !Object.entries(value.gabarito || {}).some(
                          ([a, escolhido]) => a !== txt && escolhido === b
                        )
                    )
                    .map((b, j) => (
                      <option key={j} value={b}>
                        {b || `Item B${j + 1}`}
                      </option>
                    ))}
                </select>

                <button
                  className="remover"
                  type="button"
                  onClick={() => {
                    const arr = [...(value.colA || [])];
                    arr.splice(i, 1);
                    const novoGabarito = { ...(value.gabarito || {}) };
                    delete novoGabarito[txt];
                    atualizar({ colA: arr, gabarito: novoGabarito });
                  }}
                >
                  Remover
                </button>
              </div>
            ))}

            <button
              className="button"
              type="button"
              onClick={() => atualizar({ colA: [...(value.colA || []), ""] })}
            >
              + Item A
            </button>
          </div>

          
          <div>
            <p>Coluna B</p>
            {(value?.colB || [""]).map((txt, i) => (
              <div key={`B-${i}`} className="pair-row">
                <input
                  type="text"
                  value={txt}
                  onChange={(e) => {
                    const arr = [...(value.colB || [])];
                    const antigo = arr[i];
                    arr[i] = e.target.value;

                  
                    const novoGabarito = {};
                    Object.entries(value.gabarito || {}).forEach(([a, b]) => {
                      novoGabarito[a] = b === antigo ? e.target.value : b;
                    });

                    atualizar({ colB: arr, gabarito: novoGabarito });
                  }}
                  placeholder={`Item B${i + 1}`}
                />

              
                <button
                  className="remover"
                  type="button"
                  onClick={() => {
                    const arr = [...(value.colB || [])];
                    const removido = arr[i];
                    arr.splice(i, 1);

                    const novoGabarito = {};
                    Object.entries(value.gabarito || {}).forEach(([a, b]) => {
                      if (b !== removido) novoGabarito[a] = b;
                    });

                    atualizar({ colB: arr, gabarito: novoGabarito });
                  }}
                >
                  Remover
                </button>
              </div>
            ))}

            <button
              className="button"
              type="button"
              onClick={() => atualizar({ colB: [...(value.colB || []), ""] })}
            >
              + Item B
            </button>
          </div>
        </div>
      )}

   
      <label>
        <p>Valor da questão (opcional)</p>
        <input
          type="number"
          min="0"
          value={value?.valor ?? ""}
          onChange={(e) =>
            atualizar({ valor: e.target.value ? Number(e.target.value) : undefined })
          }
        />
      </label>
    </div>
  );
}


export async function uploadArquivo(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "materiais_professor");
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/auto/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) throw new Error("Erro ao enviar arquivo");
  return await response.json();
}
