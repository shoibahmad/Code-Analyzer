"""
Optional: Script to train a custom code quality classifier
This demonstrates how you could train your own model on labeled code samples
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np

class CodeQualityTrainer:
    def __init__(self):
        self.model_name = "microsoft/codebert-base"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        
    def prepare_dataset(self, code_samples, labels):
        """
        Prepare dataset for training
        code_samples: list of code strings
        labels: list of quality scores (0-10)
        """
        encodings = self.tokenizer(code_samples, truncation=True, padding=True, max_length=512)
        
        class CodeDataset(torch.utils.data.Dataset):
            def __init__(self, encodings, labels):
                self.encodings = encodings
                self.labels = labels
            
            def __getitem__(self, idx):
                item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
                item['labels'] = torch.tensor(self.labels[idx])
                return item
            
            def __len__(self):
                return len(self.labels)
        
        return CodeDataset(encodings, labels)
    
    def train(self, train_dataset, val_dataset, output_dir='./code_quality_model'):
        """Train the model"""
        model = AutoModelForSequenceClassification.from_pretrained(
            self.model_name, 
            num_labels=11  # 0-10 quality scores
        )
        
        training_args = TrainingArguments(
            output_dir=output_dir,
            num_train_epochs=3,
            per_device_train_batch_size=8,
            per_device_eval_batch_size=8,
            warmup_steps=500,
            weight_decay=0.01,
            logging_dir='./logs',
            logging_steps=10,
            evaluation_strategy="epoch",
            save_strategy="epoch",
            load_best_model_at_end=True,
        )
        
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=val_dataset,
        )
        
        trainer.train()
        trainer.save_model(output_dir)
        print(f"Model saved to {output_dir}")

# Example usage:
if __name__ == "__main__":
    # Sample data (you would need a real labeled dataset)
    sample_codes = [
        "def add(a, b): return a + b",  # Good code
        "def add(x,y):return x+y",  # Poor formatting
        "eval(user_input)",  # Security issue
    ]
    
    sample_labels = [9, 5, 2]  # Quality scores
    
    trainer = CodeQualityTrainer()
    
    # Split data
    train_codes, val_codes, train_labels, val_labels = train_test_split(
        sample_codes, sample_labels, test_size=0.2, random_state=42
    )
    
    # Prepare datasets
    train_dataset = trainer.prepare_dataset(train_codes, train_labels)
    val_dataset = trainer.prepare_dataset(val_codes, val_labels)
    
    # Train (uncomment to actually train)
    # trainer.train(train_dataset, val_dataset)
    
    print("Training script ready. Add your labeled dataset to train a custom model.")
