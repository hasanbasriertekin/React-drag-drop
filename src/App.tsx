import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import type { Quote as QuoteType } from '../types'
import { nanoid } from 'nanoid'
import { Button, Modal, Form, InputGroup } from 'react-bootstrap'
import './App.css'

const initial = Array.from({ length: 10 }, (v, k) => k).map(k => {
  const custom: QuoteType = {
    id: `id-${k}`,
    content: `Quote ${k}`
  };

  return custom;
});

const grid = 8;
const reorder = (list, startIndex, endIndex): QuoteType[] => {
  const result: QuoteType[] = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const QuoteItem = styled.div`
  width: 280px;
  height: 40px;
  border: 1px solid grey;
  margin-bottom: ${grid}px;
  background-color: lightblue;
  padding: ${grid}px;
`;

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Sayfa yüksekliğinin tamamını kaplamak için */
`;

const QuoteItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 5px;
`;

function Quote({ quote, index, onEditClick }: { quote: QuoteType, index: number, onEditClick: (quoteId: string) => void }) {
  const handleClick = () => {
    onEditClick(quote.id);
  };

  return (
    <Draggable draggableId={quote.id} index={index}>
      {provided => (
        <div>
          <QuoteItemContainer
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <QuoteItem>
              {quote.content}
            </QuoteItem>
            <Button variant="outline-light fw-bold" className="edit-button" onClick={handleClick}>
              Düzenle
            </Button>
          </QuoteItemContainer>
        </div>
      )}
    </Draggable>
  );
}

const QuoteList = React.memo(function QuoteList({ quotes, onEditClick }: { quotes: QuoteType[], onEditClick: (quoteId: string) => void }) {
  return quotes.map((quote: QuoteType, index: number) => (
    <Quote quote={quote} index={index} key={quote.id} onEditClick={onEditClick} />
  ));
});

function App() {
  const [newQuoteContent, setNewQuoteContent] = useState(""); // State for new quote content
  const [state, setState] = useState({ quotes: initial });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editDialogTodoId, setEditDialogTodoId] = useState<string | null>(null);
  const [editedQuoteContent, setEditedQuoteContent] = useState("");

  useEffect(() => {
    // Sayfa açıldığında boş bir liste ile başla
    setState({ quotes: [] });
  }, []);

  function onDragEnd(result: any) {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const quotes: QuoteType[] = reorder(
      state.quotes,
      result.source.index,
      result.destination.index
    );

    setState({ quotes });
  }

  const handleEditClick = (quoteId: string) => {
    setEditDialogTodoId(quoteId);
    setIsEditDialogOpen(true);
    const quoteToEdit = state.quotes.find((quote) => quote.id === quoteId);
    setEditedQuoteContent(quoteToEdit?.content || "");
  };

  const handleEditClose = () => {
    setIsEditDialogOpen(false);
    setEditDialogTodoId(null);
    setEditedQuoteContent("");
  };

  const handleEditSave = () => {
    if (editedQuoteContent.trim() === "") {
      // Düzenlenmiş içerik boş olamaz
      return;
    }

    const updatedQuotes = state.quotes.map((quote) =>
      quote.id === editDialogTodoId
        ? { ...quote, content: editedQuoteContent }
        : quote
    );

    setState({ quotes: updatedQuotes });
    handleEditClose();
  };

  const handleDelete = () => {
    const updatedQuotes = state.quotes.filter((quote) => quote.id !== editDialogTodoId);
    setState({ quotes: updatedQuotes });
    handleEditClose(); // Düzenleme modalini kapat
  };


  return (
    <>
      <CenteredContainer>
        <div className="app-container" >
        <InputGroup className="mb-3" style={{ width: '700px' }}>
            <Form.Control
              placeholder="Listeye Ürün Ekle"
              aria-label="Listeye Ürün Ekle"
              aria-describedby="basic-addon2"
              value={newQuoteContent}
              onChange={(e) => setNewQuoteContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (newQuoteContent.trim() === "") {
                    return; // Boş alıntı eklenemez
                  }

                  const newQuote: QuoteType = {
                    id: `id-${nanoid()}`,
                    content: newQuoteContent
                  };

                  setState((prevState) => ({
                    quotes: [...prevState.quotes, newQuote]
                  }));

                  setNewQuoteContent(""); // Input'u temizle
                }
              }}
            />
            <Button
              variant="success"
              size="lg"
              onClick={() => {
                if (newQuoteContent.trim() === "") {
                  return; // Boş alıntı eklenemez
                }

                const newQuote: QuoteType = {
                  id: `id-${nanoid()}`,
                  content: newQuoteContent
                };

                setState((prevState) => ({
                  quotes: [...prevState.quotes, newQuote]
                }));

                setNewQuoteContent(""); // Input'u temizle
              }}
              id="button-addon2"
            >
              Ekle
            </Button>
          </InputGroup>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="list">
              {provided => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <QuoteList quotes={state.quotes} onEditClick={handleEditClick} />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <Modal show={isEditDialogOpen} onHide={handleEditClose}>
          <Modal.Header closeButton>
            <Modal.Title>Düzenle</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              type="text"
              value={editedQuoteContent}
              onChange={(e) => setEditedQuoteContent(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleEditClose}>
              İptal
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Sil
            </Button>
            <Button variant="primary" onClick={handleEditSave}>
              Kaydet
            </Button>
          </Modal.Footer>
        </Modal>
      </CenteredContainer>
    </>
  );
}

export default App;