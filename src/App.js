import React from 'react';
import './App.scss';

function App() {
  // 商品數據（硬編碼）
  const products = [
    {
      id: 1,
      name: "商品1",
      image: "https://via.placeholder.com/150"
    },
    {
      id: 2,
      name: "商品2",
      image: "https://via.placeholder.com/150"
    },
    {
      id: 3,
      name: "商品3",
      image: "https://via.placeholder.com/150"
    }
  ];

  return (
    <div className="app">
      <h1>商品列表</h1>
      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h2 className="product-name">{product.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App
