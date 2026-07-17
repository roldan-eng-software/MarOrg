"use client";

import { useState, useRef, useCallback } from "react";

interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface UseCepReturn {
  loading: boolean;
  error: string | null;
  fetchCep: (cep: string) => void;
}

export function useCep(
  onAddressFound: (data: {
    address_street: string;
    address_neighborhood: string;
    address_city: string;
    address_state: string;
  }) => void
): UseCepReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCep = useCallback(
    (cep: string) => {
      const digits = cep.replace(/\D/g, "");

      if (digits.length !== 8) {
        setError(null);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      fetch(`https://viacep.com.br/ws/${digits}/json/`, {
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao buscar CEP");
          return res.json();
        })
        .then((data: CepData) => {
          if (data.erro) {
            setError("CEP não encontrado");
            return;
          }

          onAddressFound({
            address_street: data.logradouro || "",
            address_neighborhood: data.bairro || "",
            address_city: data.localidade || "",
            address_state: data.uf || "",
          });
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setError("Erro ao buscar CEP");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    },
    [onAddressFound]
  );

  return { loading, error, fetchCep };
}
